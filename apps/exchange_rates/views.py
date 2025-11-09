# apps/exchange_rates/views.py
import json
import csv
import io
import pandas as pd
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
def upload_exchange_rates(request):
    """Upload and parse exchange rate CSV or Excel file."""
    uploaded_file = request.FILES.get("exchange_rates")

    if not uploaded_file:
        return JsonResponse({"success": False, "error": "No file uploaded."})

    # ✅ Determine file type
    file_name = uploaded_file.name.lower()
    if not (file_name.endswith(".csv") or file_name.endswith(".xlsx")):
        return JsonResponse({
            "success": False,
            "error": "Invalid file type. Only CSV or Excel (.xlsx) allowed."
        })

    try:
        # ✅ Read file into a dataframe
        if file_name.endswith(".csv"):
            try:
                decoded = uploaded_file.read().decode("utf-8")
            except UnicodeDecodeError:
                uploaded_file.seek(0)
                decoded = uploaded_file.read().decode("latin-1")

            df = pd.read_csv(io.StringIO(decoded), skiprows=1)  # skip first header
        else:
            df = pd.read_excel(uploaded_file, skiprows=1, engine='openpyxl')

        # ✅ Clean and validate columns
        required_cols = ["Currency", "USD per Unit"]
        if not all(col in df.columns for col in required_cols):
            return JsonResponse({
                "success": False,
                "error": "Invalid file format. Columns must include 'Currency' and 'USD per Unit'."
            })

        # ✅ Clear all existing records
        ExchangeRate.objects.all().delete()

        # ✅ Parse and save
        new_records = []
        for _, row in df.iterrows():
            currency_info = str(row["Currency"]).strip()
            usd_value = str(row["USD per Unit"]).strip()

            if not currency_info or not usd_value:
                continue

            try:
                code, name = currency_info.split(" ", 1)
            except ValueError:
                code, name = currency_info, ""

            obj = ExchangeRate.objects.create(
                currency_code=code,
                currency_name=name,
                usd_per_unit=usd_value,
                uploaded_by=request.user,
            )

            new_records.append({
                "currency_code": code,
                "currency_name": name,
                "usd_per_unit": usd_value,
                "last_updated": obj.updated_at.strftime("%Y-%m-%d"),
            })

        return JsonResponse({
            "success": True,
            "message": f"✅ {len(new_records)} exchange rates uploaded successfully.",
            "last_updated": timezone.now().strftime("%Y-%m-%d"),
            "data": new_records
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
