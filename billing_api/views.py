import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.auth.models import User
from apps.billing.models import BillingRun, BillingRunLineItem
from apps.customers.models import Customer
from apps.purchase_orders.models import PurchaseOrder

@csrf_exempt
def billing_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ticket = data.get('ticket_data', data)

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