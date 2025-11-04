# apps/exchange_rates/views.py
import json
import csv
import io
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import ExchangeRate

@login_required
def exchange_rate_list(request):
    """List all exchange rates."""
    rates = ExchangeRate.objects.all().values(
        "currency_code", "currency_name", "usd_per_unit", "updated_at"
    )

    formatted = [
        {
            **r,
            "last_updated": r["updated_at"].strftime("%Y-%m-%d") if r["updated_at"] else None
        }
        for r in rates
    ]

    return JsonResponse(formatted, safe=False)

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def upload_exchange_rate_csv(request):
    """Upload and parse exchange rate CSV."""
    csv_file = request.FILES.get("csv_file")

    if not csv_file or not csv_file.name.endswith(".csv"):
        return JsonResponse({"success": False, "error": "Please upload a valid CSV file."})

    try:
        try:
            decoded = csv_file.read().decode("utf-8")
        except UnicodeDecodeError:
            csv_file.seek(0)
            decoded = csv_file.read().decode("latin-1")

        io_string = io.StringIO(decoded)
        reader = csv.reader(io_string)

        # Skip headers (adjust if needed)
        next(reader, None)
        next(reader, None)

        created, updated = 0, 0
        data_list = []

        for row in reader:
            if len(row) < 2:
                continue

            currency_info = row[0].strip()
            usd_value = row[1].strip()

            try:
                code, name = currency_info.split(" ", 1)
            except ValueError:
                code, name = currency_info, ""

            obj, created_flag = ExchangeRate.objects.update_or_create(
                currency_code=code,
                defaults={
                    "currency_name": name,
                    "usd_per_unit": usd_value,
                    "uploaded_by": request.user,
                }
            )

            if created_flag:
                created += 1
            else:
                updated += 1

            data_list.append({
                "currency_code": code,
                "currency_name": name,
                "usd_per_unit": usd_value,
                "last_updated": obj.updated_at.strftime("%Y-%m-%d"),
            })

        return JsonResponse({
            "success": True,
            "message": f"✅ Uploaded successfully. {created} new, {updated} updated.",
            "last_updated": timezone.now().strftime("%Y-%m-%d"),
            "data": data_list
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def exchange_rate_api(request):
    """Return list of all exchange rates."""
    rates = ExchangeRate.objects.all().values(
        'id', 'currency_code', 'currency_name', 'usd_per_unit', 'updated_at'
    )
    data = [
        {
            **r,
            "last_updated": timezone.localtime(r["updated_at"]).strftime("%Y-%m-%d"),
        }
        for r in rates
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def exchange_rate_detail_api(request, pk):
    """Handle update/delete of specific exchange rate."""
    try:
        rate = ExchangeRate.objects.get(pk=pk)
    except ExchangeRate.DoesNotExist:
        return JsonResponse({"error": "Exchange rate not found"}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        usd_value = data.get("usd_per_unit")
        if usd_value is not None:
            rate.usd_per_unit = usd_value
            rate.save()
        return JsonResponse({"success": True, "message": "Updated successfully"})

    elif request.method == "DELETE":
        rate.delete()
        return JsonResponse({"success": True, "message": "Deleted successfully"})

    return JsonResponse({"error": "Invalid request"}, status=400)
