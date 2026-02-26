import os
import json
import uuid
import datetime
import zipfile

from urllib.parse import urlparse
from decimal import Decimal

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Sum, Count

from apps.billing.models import BillingRun, BillingRunLineItem
from apps.customers.models import Customer
from apps.purchase_orders.models import PurchaseOrder

# Supabase client (only if configured)
supabase = None
try:
    from supabase import create_client
    if getattr(settings, 'SUPABASE_URL', '') and getattr(settings, 'SUPABASE_KEY', ''):
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except ImportError:
    pass

@csrf_exempt
def billing_api(request):
    """API endpoint to receive billing data from n8n"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            ticket = data.get("ticket_data", data)

            default_user = User.objects.first()
            if not default_user:
                return JsonResponse({'error': 'No user found'}, status=500)

            customer_name = ticket.get('account', 'Unknown')
            customer, _ = Customer.objects.get_or_create(
                name=customer_name,
                defaults={'created_by': default_user}
            )

            # --- PO HANDLING WITH REVIEW FLAG ---
            purchase_order = None
            po_number = ticket.get('vendor_po', '')
            po_status = 'active'  # Default status

            if po_number:
                purchase_order = PurchaseOrder.objects.filter(po_number=po_number).first()

                if not purchase_order:
                    # Create new PO with pending review
                    purchase_order = PurchaseOrder.objects.create(
                        po_number=po_number,
                        customer=customer,
                        total_amount=0,  # Will be set during review
                        valid_from=timezone.now().date(),
                        valid_until=timezone.now().date() + timezone.timedelta(days=365),
                        status='pending',  # Original status field
                        review_status='pending_review',  # New review field
                        requires_review=True,
                        created_by=default_user
                    )
                    po_status = 'pending_review'
                    print(f"⚠️ New PO created - requires review: {po_number}")
                else:
                    # Check if existing PO needs review
                    po_status = getattr(purchase_order, 'review_status', 'active')
                    if po_status == 'pending_review':
                        print(f"⏳ PO {po_number} is pending review")

            # --- Generate unique run_id ---
            unique_id = uuid.uuid4().hex[:8].upper()
            new_run_id = f"BR-{timezone.now().strftime('%Y%m%d')}-{unique_id}"

            # --- Determine billing run status based on PO review status ---
            billing_run_status = 'pending_po_review' if po_status == 'pending_review' else 'completed'

            billing_run = BillingRun.objects.create(
                run_id=new_run_id,
                customer=customer,
                amount=ticket.get('final_amount', 0),
                billing_date=timezone.now().date(),
                status=billing_run_status,
                billing_type='automated',
                notes=f"Auto-billing for {ticket.get('ticket_number', 'Unknown')}",
                processed_by=default_user,
                processed_at=timezone.now(),
                purchase_order=purchase_order,
                account=None,
                billing_start_date=timezone.now().date(),
                billing_end_date=timezone.now().date(),
                tickets_count=1
            )

            # Create line item
            BillingRunLineItem.objects.create(
                billing_run=billing_run,
                description=f"Ticket: {ticket.get('ticket_number', 'Unknown')} - {ticket.get('city', '')}, {ticket.get('country', '')}",
                quantity=ticket.get('work_hours', 0),
                unit_rate=ticket.get('hourly_rate', 0),
                total_amount=ticket.get('final_amount', 0),
                ticket_reference=ticket.get('ticket_number', ''),
                work_date=timezone.now().date(),
                category='dedicated'
            )

            # --- Return appropriate response ---
            if po_status == 'pending_review':
                return JsonResponse({
                    'status': 'pending_review',
                    'message': 'Billing data saved - pending PO review',
                    'billing_run_id': billing_run.run_id,
                    'po_number': po_number,
                    'requires_review': True
                }, status=202)
            else:
                return JsonResponse({
                    'status': 'success',
                    'message': 'Billing data saved',
                    'billing_run_id': billing_run.run_id
                }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


@login_required
def get_pending_pos(request):
    """API endpoint to get all POs pending review"""
    pending_pos = PurchaseOrder.objects.filter(
        Q(review_status='pending_review') | Q(requires_review=True)
    ).select_related('customer', 'account').order_by('-created_at')

    data = []
    for po in pending_pos:
        # Get related billing runs
        billing_runs = po.billingrun_set.filter(status='pending_po_review').values('id', 'run_id', 'amount')

        data.append({
            'id': po.id,
            'po_number': po.po_number,
            'customer': po.customer.name,
            'account': po.account.name if po.account else None,
            'currency': po.currency,
            'total_amount': str(po.total_amount),
            'created_at': po.created_at.strftime('%Y-%m-%d %H:%M'),
            'ticket_amount': '1716.00',  # This would come from related billing runs
            'billing_runs': list(billing_runs)
        })

    return JsonResponse({'pending_pos': data})


@csrf_exempt
@login_required
def approve_po(request, po_id):
    """Approve a PO with the given amount"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body)
        amount = data.get('amount')

        if not amount:
            return JsonResponse({'error': 'Amount required'}, status=400)

        po = PurchaseOrder.objects.get(id=po_id)
        po.total_amount = Decimal(amount)
        po.review_status = 'approved'
        po.requires_review = False
        po.reviewed_at = timezone.now()
        po.reviewed_by = request.user
        po.save()

        # Update any pending billing runs
        updated = po.billingrun_set.filter(status='pending_po_review').update(status='completed')

        return JsonResponse({
            'success': True,
            'message': f'PO {po.po_number} approved with amount {amount}',
            'updated_billing_runs': updated
        })

    except PurchaseOrder.DoesNotExist:
        return JsonResponse({'error': 'PO not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@login_required
def reject_po(request, po_id):
    """Reject a PO"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body)
        notes = data.get('notes', '')

        po = PurchaseOrder.objects.get(id=po_id)
        po.review_status = 'rejected'
        po.review_notes = notes
        po.reviewed_at = timezone.now()
        po.reviewed_by = request.user
        po.save()

        return JsonResponse({
            'success': True,
            'message': f'PO {po.po_number} rejected'
        })

    except PurchaseOrder.DoesNotExist:
        return JsonResponse({'error': 'PO not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
def get_dashboard_stats(request):
    """Get dashboard statistics"""
    stats = {
        'pending_review_count': PurchaseOrder.objects.filter(
            Q(review_status='pending_review') | Q(requires_review=True)
        ).count(),
        'total_pos': PurchaseOrder.objects.count(),
        'pending_billing_runs': BillingRun.objects.filter(status='pending_po_review').count(),
        'completed_billing_runs': BillingRun.objects.filter(status='completed').count(),
    }
    return JsonResponse(stats)


@login_required
def get_all_purchase_orders(request):
    """Get all purchase orders (for reference)"""
    pos = PurchaseOrder.objects.select_related('customer', 'account').all().order_by('-created_at')[:100]

    data = []
    for po in pos:
        data.append({
            'id': po.id,
            'po_number': po.po_number,
            'customer': po.customer.name,
            'account': po.account.name if po.account else None,
            'currency': po.currency,
            'total_amount': str(po.total_amount),
            'spent_amount': str(po.spent_amount),
            'remaining_balance': str(po.remaining_balance),
            'status': po.status,
            'review_status': po.review_status,
            'created_at': po.created_at.strftime('%Y-%m-%d'),
            'valid_until': po.valid_until.strftime('%Y-%m-%d') if po.valid_until else None,
        })

    return JsonResponse({'purchase_orders': data})


# ================== MONITOR / WORKFLOW VIEWS ===================

@csrf_exempt
def upload_zip(request):
    """N8N FSO Data Files Receiver"""
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required"}, status=400)

    if not supabase:
        return JsonResponse({"error": "Supabase not configured"}, status=503)

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


@csrf_exempt
def workflow_report(request):
    """N8N Node Report Data"""
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    required_fields = ["workflow", "region", "node", "executed", "workflowDurationMs", "workflowDuration", "status", "data"]
    missing = [field for field in required_fields if field not in payload]
    if missing:
        return JsonResponse({"error": f"Missing fields: {missing}"}, status=400)

    print("Received workflow report:", payload)
    return JsonResponse({"status": "success"})


def get_workflow_execution_rows(request):
    if not supabase:
        return JsonResponse({"error": "Supabase not configured"}, status=503)
    try:
        result = supabase.table("workflow_executions").select("*").order("id", desc=False).execute()
        data = result.model_dump()
        rows = data.get("data", [])
        return JsonResponse({"success": True, "rows": rows})
    except Exception as e:
        return JsonResponse({"error": str(e)})


@csrf_exempt
def remove_workflow_cycle(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid method"}, status=405)

    if not supabase:
        return JsonResponse({"error": "Supabase not configured"}, status=503)

    body = json.loads(request.body)
    cycle_ids = body.get("cycleIDs")

    if not cycle_ids or not isinstance(cycle_ids, list):
        return JsonResponse({"success": False, "error": "cycleIDs must be a non-empty array"}, status=400)

    results = []

    for cycle_id in cycle_ids:
        deleted_files = []
        skipped_files = []

        try:
            records = (
                supabase.table("workflow_executions")
                .select("id, node_type, data")
                .eq("cycle_Id", cycle_id)
                .execute()
            )

            for row in records.data or []:
                node_type = row.get("node_type")
                raw_data = row.get("data")
                data = _normalize_data(raw_data)

                if node_type not in ["Upload", "Ticket Gen"]:
                    continue
                if not data:
                    continue

                for item in data:
                    signed_url = item.get("url")
                    if not signed_url:
                        continue

                    bucket, object_path = _extract_bucket_and_path(signed_url)

                    if not bucket or not object_path:
                        skipped_files.append({"reason": "invalid_url", "url": signed_url})
                        continue

                    response = supabase.storage.from_(bucket).remove([object_path])

                    if response and getattr(response, "errors", None):
                        skipped_files.append({"bucket": bucket, "path": object_path, "reason": response.errors})
                    else:
                        deleted_files.append({"bucket": bucket, "path": object_path})

            delete_result = (
                supabase.table("workflow_executions")
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
            results.append({
                "cycle_id": cycle_id,
                "success": False,
                "error": str(e),
                "files_deleted": deleted_files,
                "files_skipped": skipped_files
            })

    return JsonResponse({"success": True, "results": results})


def list_last_month_excels(request):
    if not supabase:
        return JsonResponse({"error": "Supabase not configured"}, status=503)
    try:
        today = datetime.date.today()
        first_day_this_month = today.replace(day=1)
        last_month_last_day = first_day_this_month - datetime.timedelta(days=1)

        prev_month = last_month_last_day.strftime("%b")
        prev_year = last_month_last_day.strftime("%Y")
        folder_prefix = f"{prev_month}_{prev_year}_"

        root_files = supabase.storage.from_(settings.SUPABASE_BUCKET).list()
        matching_folders = [f["name"] for f in root_files if f["name"].startswith(folder_prefix)]

        all_excel_files = []
        for folder in matching_folders:
            items = supabase.storage.from_(settings.SUPABASE_BUCKET).list(path=folder)
            for file in items:
                name = file.get("name")
                if not name:
                    continue
                if name.endswith((".xlsx", ".xls")):
                    full_path = f"{folder}/{name}"
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


# ================== HELPER FUNCTIONS ===================

def _extract_bucket_and_path(signed_url: str):
    """Extract bucket name and object path from Supabase signed URL"""
    parsed = urlparse(signed_url)
    parts = parsed.path.split("/object/sign/")
    if len(parts) != 2:
        return None, None
    full_path = parts[1]
    bucket, object_path = full_path.split("/", 1)
    return bucket, object_path


def _normalize_data(data):
    if isinstance(data, list):
        return data
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return []
    return []
