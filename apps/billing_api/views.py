from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from decimal import Decimal
import json

from apps.purchase_orders.models import PurchaseOrder
from apps.customers.models import Customer
from apps.billing.models import BillingRun

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