import os
import json
import datetime
import zipfile

from urllib.parse import urlparse
from decimal import Decimal

from supabase import create_client

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.conf import settings
from django.shortcuts import render

from apps.purchase_orders.models import PurchaseOrder
from apps.customers.models import Customer
from apps.billing.models import BillingRun


# ================== SUPABASE CLIENT ===================

# Initialize Supabase client (only if configured)
supabase = None
if getattr(settings, 'SUPABASE_URL', '') and getattr(settings, 'SUPABASE_KEY', ''):
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# ================== PO REVIEW API VIEWS ===================

@csrf_exempt
@require_http_methods(["GET"])
def get_pending_pos(request):
    try:
        pending_pos = PurchaseOrder.objects.filter(
            review_status='pending_review'
        ).select_related('customer', 'account').order_by('-created_at')

        data = []
        for po in pending_pos:
            data.append({
                'id': po.id,
                'po_number': po.po_number,
                'customer': po.customer.name if po.customer else None,
                'account': po.account.name if po.account else None,
                'current_amount': str(po.total_amount),
                'currency': po.currency,
                'created_at': po.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'requires_review': po.requires_review,
            })

        return JsonResponse({'success': True, 'data': data, 'count': len(data)})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_all_purchase_orders(request):
    try:
        queryset = PurchaseOrder.objects.all().select_related('customer', 'account').order_by('-created_at')
        data = []
        for po in queryset:
            data.append({
                'id': po.id,
                'po_number': po.po_number,
                'customer': po.customer.name if po.customer else None,
                'account': po.account.name if po.account else None,
                'total_amount': str(po.total_amount),
                'spent_amount': str(po.spent_amount),
                'remaining_balance': str(po.remaining_balance),
                'currency': po.currency,
                'status': po.status,
                'review_status': po.review_status,
                'requires_review': po.requires_review,
                'created_at': po.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            })
        return JsonResponse({'success': True, 'data': data, 'count': len(data)})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def approve_po(request, po_id):
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        if not amount:
            return JsonResponse({'success': False, 'error': 'Amount required'}, status=400)
        po = PurchaseOrder.objects.get(id=po_id)
        po.total_amount = Decimal(str(amount))
        po.review_status = 'approved'
        po.requires_review = False
        po.reviewed_at = timezone.now()
        po.save()
        updated_runs = po.billingrun_set.filter(status='pending_po_review').update(status='completed')
        return JsonResponse({'success': True, 'message': f'PO {po.po_number} approved'})
    except PurchaseOrder.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'PO not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def reject_po(request, po_id):
    try:
        data = json.loads(request.body)
        notes = data.get('notes', '')
        po = PurchaseOrder.objects.get(id=po_id)
        po.review_status = 'rejected'
        po.review_notes = notes
        po.reviewed_at = timezone.now()
        po.save()
        return JsonResponse({'success': True, 'message': f'PO {po.po_number} rejected'})
    except PurchaseOrder.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'PO not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_dashboard_stats(request):
    try:
        total_pos = PurchaseOrder.objects.count()
        pending_review = PurchaseOrder.objects.filter(review_status='pending_review').count()
        active_pos = PurchaseOrder.objects.filter(status='active').count()
        return JsonResponse({
            'success': True,
            'data': {
                'total_purchase_orders': total_pos,
                'pending_review': pending_review,
                'active_pos': active_pos,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ================== MONITOR / WORKFLOW VIEWS ===================

def index(request):
    return render(request, "index.html",)

# N8N FSO Data Files Receiver
@csrf_exempt
def upload_zip(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required"}, status=400)

    if 'file' not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    zip_file = request.FILES['file']
    folder_name = os.path.splitext(zip_file.name)[0]

    try:
        with zipfile.ZipFile(zip_file) as z:
            for filename in z.namelist():
                if filename.endswith(('.xlsx', '.xls')):
                    with z.open(filename) as f:
                        supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                            f"{folder_name}/{os.path.basename(filename)}",
                            f.read(),
                            {"content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
                        )
        return JsonResponse({"status": "success"})
    except zipfile.BadZipFile:
        return JsonResponse({"error": "Invalid zip file"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# N8N Node Report Data
@csrf_exempt
def workflow_report(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate required fields
    required_fields = ["workflow", "region", "node", "executed", "workflowDurationMs", "workflowDuration", "status", "data"]
    missing = [field for field in required_fields if field not in payload]
    if missing:
        return JsonResponse({"error": f"Missing fields: {missing}"}, status=400)

    # Optionally: save to database or log it
    # Example: just printing for now
    print("Received workflow report:", payload)

    return JsonResponse({"status": "success"})


# ================== SUPABASE ===================

def get_workflow_execution_rows(request):
    try:
        result = supabase.table("workflow_executions").select("*").order("id", desc=False).execute()

        # Convert response to dict (supabase v2 returns pydantic model)
        data = result.model_dump()

        # The actual rows are inside `data['data']`
        rows = data.get("data", [])

        return JsonResponse({
            "success": True,
            "rows": rows
        })

    except Exception as e:
        return JsonResponse({"error": str(e)})

@csrf_exempt
def remove_workflow_cycle(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "error": "Invalid method"},
            status=405
        )

    body = json.loads(request.body)
    cycle_ids = body.get("cycleIDs")

    if not cycle_ids or not isinstance(cycle_ids, list):
        return JsonResponse(
            {"success": False, "error": "cycleIDs must be a non-empty array"},
            status=400
        )

    results = []

    for cycle_id in cycle_ids:
        deleted_files = []
        skipped_files = []

        try:
            # Fetch rows for this cycle
            records = (
                supabase
                .table("workflow_executions")
                .select("id, node_type, data")
                .eq("cycle_Id", cycle_id)
                .execute()
            )

            for row in records.data or []:
                node_type = row.get("node_type")
                raw_data = row.get("data")
                data = normalize_data(raw_data)

                if node_type not in ["Upload", "Ticket Gen"]:
                    continue

                if not data:
                    continue

                for item in data:
                    signed_url = item.get("url")
                    if not signed_url:
                        continue

                    bucket, object_path = extract_bucket_and_path(signed_url)

                    if not bucket or not object_path:
                        skipped_files.append({
                            "reason": "invalid_url",
                            "url": signed_url
                        })
                        continue

                    # Optional file delete
                    response = supabase.storage.from_(bucket).remove([object_path])

                    if response and getattr(response, "errors", None):
                        skipped_files.append({
                            "bucket": bucket,
                            "path": object_path,
                            "reason": response.errors
                        })
                    else:
                        deleted_files.append({
                            "bucket": bucket,
                            "path": object_path
                        })

            # Delete DB rows for this cycle
            delete_result = (
                supabase
                .table("workflow_executions")
                .delete()
                .eq("cycle_Id", cycle_id)
                .execute()
            )

            results.append({
                "cycle_id": cycle_id,
                "success": True,
                "deleted_rows": len(delete_result.data) if delete_result.data else 0,
                "files_deleted": deleted_files,
                "files_skipped": skipped_files
            })

        except Exception as e:
            # Per-cycle failure should not break others
            results.append({
                "cycle_id": cycle_id,
                "success": False,
                "error": str(e),
                "files_deleted": deleted_files,
                "files_skipped": skipped_files
            })

    return JsonResponse({
        "success": True,
        "results": results
    })


def list_last_month_excels(request):
    try:
        # 1. Compute previous month
        today = datetime.date.today()
        first_day_this_month = today.replace(day=1)
        last_month_last_day = first_day_this_month - datetime.timedelta(days=1)

        prev_month = last_month_last_day.strftime("%b")   # Nov, Oct, etc.
        prev_year = last_month_last_day.strftime("%Y")    # 2025

        folder_prefix = f"{prev_month}_{prev_year}_"      # e.g., "Nov_2025_"

        # 2. List folders in root
        root_files = supabase.storage.from_(settings.SUPABASE_BUCKET).list()

        # 3. Filter only folders matching prefix
        matching_folders = [
            f["name"] for f in root_files
            if f["name"].startswith(folder_prefix)
        ]

        all_excel_files = []

        # 4. For each folder, list Excel files
        for folder in matching_folders:
            items = supabase.storage.from_(settings.SUPABASE_BUCKET).list(path=folder)

            for file in items:
                name = file.get("name")
                if not name:
                    continue

                if name.endswith((".xlsx", ".xls")):
                    full_path = f"{folder}/{name}"

                    # public URL is returned as a string
                    url = supabase.storage.from_(settings.SUPABASE_BUCKET).create_signed_url(full_path, 3600)['signedURL']

                    all_excel_files.append({
                        "folder": folder,
                        "file_name": name,
                        "path": full_path,
                        "url": url,
                    })

        return JsonResponse({"files": all_excel_files})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ================== SUPABASE HELPER FUNCTIONS ===================

def extract_bucket_and_path(signed_url: str):
    """
    Extract bucket name and object path from Supabase signed URL
    """
    parsed = urlparse(signed_url)
    parts = parsed.path.split("/object/sign/")

    if len(parts) != 2:
        return None, None

    full_path = parts[1]  # bucket/path/to/file
    bucket, object_path = full_path.split("/", 1)

    return bucket, object_path


def normalize_data(data):
    if isinstance(data, list):
        return data
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return []
    return []
