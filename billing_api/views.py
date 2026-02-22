import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q, Sum, Count
from apps.purchase_orders.models import PurchaseOrder
from apps.billing.models import BillingRun
from decimal import Decimal

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
@csrf_exempt
def billing_api(request):
    """API endpoint to receive billing data from n8n"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            ticket = data.get("ticket_data", data)
            return JsonResponse({"status": "pending_review", "message": "Billing data received"}, status=202)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Only POST allowed"}, status=405)
