from datetime import date, timedelta
import uuid
import logging
import json

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models.functions import Lower
from django.utils.dateformat import format
from django.views import View

from .models import BillingRun, InitialTicket
from apps.customers.models import Customer, Account, BillingCycle, Currency, Country
from apps.customers.forms import AccountForm
from apps.purchase_orders.models import PurchaseOrder
from apps.rate_cards.models import RateCard
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

logger = logging.getLogger("billing")


@login_required
def test_page(request):
    """A simple test page for billing with customers and accounts"""
    try:
        # Fetch customers
        customers = Customer.objects.filter(is_active=True).order_by(Lower("name"))

        # Fetch accounts
        accounts = (
            Account.objects.select_related(
                "customer", "billing_cycle", "currency", "country"
            )
            .filter(is_active=True)
            .order_by("customer__name", "name")
        )

        # Build customers JSON
        customers_data = [
            {
                "id": customer.id,
                "name": str(customer.name),
                "code": str(customer.code or ""),
                "account_count": customer.accounts.filter(is_active=True).count(),
            }
            for customer in customers
        ]
        customers_json = json.dumps(customers_data, ensure_ascii=False)

        # Build accounts JSON
        accounts_data = [
            {
                "id": account.id,
                "customer_id": account.customer.id if account.customer else None,
                "name": str(account.name or ""),
                "account_id": str(getattr(account, "account_id", "") or ""),
            }
            for account in accounts
        ]
        accounts_json = json.dumps(accounts_data, ensure_ascii=False)

        context = {
            "customers": customers,
            "accounts": accounts,
            "customers_json": customers_json,
            "accounts_json": accounts_json,
            "form": AccountForm(),
            "currencies": Currency.objects.filter(is_active=True),
            "countries": Country.objects.filter(is_active=True),
        }

    except Exception as e:
        logger.error(f"Error loading billing test page data: {e}", exc_info=True)
        context = {
            "customers": [],
            "accounts": [],
            "customers_json": "[]",
            "accounts_json": "[]",
            "form": AccountForm(),
            "currencies": Currency.objects.filter(is_active=True),
            "countries": Country.objects.filter(is_active=True),
        }

    return render(request, "billing/test.html", context)


@login_required
def billing_run_list(request):
    billing_runs = BillingRun.objects.select_related(
        "customer", "account", "purchase_order", "processed_by"
    ).order_by("-created_at")

    # Filter functionality
    status_filter = request.GET.get("status")
    customer_filter = request.GET.get("customer")

    if status_filter:
        billing_runs = billing_runs.filter(status=status_filter)

    if customer_filter:
        billing_runs = billing_runs.filter(customer_id=customer_filter)

    # Pagination
    paginator = Paginator(billing_runs, 20)
    page_number = request.GET.get("page")
    billing_runs = paginator.get_page(page_number)

    # Get customers for filter
    customers = Customer.objects.filter(is_active=True).order_by("name")

    context = {
        "billing_runs": billing_runs,
        "customers": customers,
        "status_filter": status_filter,
        "customer_filter": customer_filter,
        "status_choices": BillingRun.STATUS_CHOICES,
    }
    return render(request, "billing/list.html", context)


@login_required
def create_billing_run_wizard(request):
    """Multi-step wizard for creating billing runs"""
    if request.method == "POST":
        return handle_billing_run_creation(request)

    # GET request - show the wizard
    customers = Customer.objects.filter(is_active=True).order_by("name")
    today = date.today()

    # Calculate current and previous month for quick selection
    current_month = format(today, "F Y")
    previous_month = format(today.replace(day=1) - timedelta(days=1), "F Y")

    context = {
        "customers": customers,
        "current_month": current_month,
        "previous_month": previous_month,
    }

    return render(request, "billing/create_wizard.html", context)


def handle_billing_run_creation(request):
    """Handle the form submission from the wizard"""
    try:
        customer_id = request.POST.get("customer_id")
        account_id = request.POST.get("account_id")
        period_type = request.POST.get("period_type")
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")
        step = int(request.POST.get("step", 1))

        # Validate required fields
        if not customer_id or not account_id:
            return JsonResponse(
                {"success": False, "error": "Customer and account are required"}
            )

        customer = get_object_or_404(Customer, id=customer_id)
        account = get_object_or_404(Account, id=account_id)

        # Get active purchase order for the account
        active_po = account.purchase_orders.filter(status="active").first()
        if not active_po:
            return JsonResponse(
                {
                    "success": False,
                    "error": "No active purchase order found for this account",
                }
            )

        # Calculate billing period dates
        billing_start, billing_end = calculate_billing_period(
            period_type, start_date, end_date
        )

        # Generate unique run ID
        run_id = f"BR-{date.today().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

        # For now, create a basic billing run - in a full implementation,
        # you would process tickets, apply rates, etc.
        billing_amount = calculate_billing_amount(account, billing_start, billing_end)

        billing_run = BillingRun.objects.create(
            run_id=run_id,
            customer=customer,
            account=account,
            purchase_order=active_po,
            amount=billing_amount,
            billing_start_date=billing_start,
            billing_end_date=billing_end,
            processed_by=request.user,
            notes=f"Created via wizard - Period: {period_type}",
        )

        # Update PO remaining balance
        if active_po.remaining_balance >= billing_amount:
            active_po.remaining_balance -= billing_amount
            active_po.save()

            # Update account status
            account.update_status()
        else:
            return JsonResponse(
                {
                    "success": False,
                    "error": f"Insufficient PO balance. Available: {active_po.remaining_balance}, Required: {billing_amount}",
                }
            )

        return JsonResponse(
            {
                "success": True,
                "billing_run_id": billing_run.id,
                "run_id": run_id,
                "message": "Billing run created successfully!",
            }
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


def calculate_billing_period(period_type, start_date=None, end_date=None):
    """Calculate billing period start and end dates"""
    today = date.today()

    if period_type == "current_month":
        start_date = today.replace(day=1)
        next_month = (
            start_date.replace(month=start_date.month + 1)
            if start_date.month < 12
            else start_date.replace(year=start_date.year + 1, month=1)
        )
        end_date = next_month - timedelta(days=1)
    elif period_type == "previous_month":
        start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        end_date = today.replace(day=1) - timedelta(days=1)
    elif period_type == "custom" and start_date and end_date:
        from datetime import datetime

        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        # Default to current month
        start_date = today.replace(day=1)
        next_month = (
            start_date.replace(month=start_date.month + 1)
            if start_date.month < 12
            else start_date.replace(year=start_date.year + 1, month=1)
        )
        end_date = next_month - timedelta(days=1)

    return start_date, end_date


def calculate_billing_amount(account, start_date, end_date):
    """Calculate billing amount for the account and period"""
    # This is a simplified calculation - in reality, you would:
    # 1. Import and process ticket data
    # 2. Apply rate cards
    # 3. Calculate based on actual work performed

    # For now, return a sample amount based on account's rate card
    rate_card = RateCard.objects.filter(
        customer=account.customer, is_active=True
    ).first()
    if rate_card:
        # Simple calculation: rate * days in period
        days = (end_date - start_date).days + 1
        return float(rate_card.rate_per_unit * days)

    # Default sample amount
    return 5000.00


# API endpoints for AJAX calls
@login_required
def get_customer_accounts_api(request, customer_id):
    """API endpoint to get accounts for a customer"""
    try:
        customer = get_object_or_404(Customer, id=customer_id)
        accounts = Account.objects.filter(customer=customer, is_active=True)

        accounts_data = []
        for account in accounts:
            accounts_data.append(
                {
                    "id": account.id,
                    "account_id": account.account_id,
                    "name": account.name,
                    "billing_cycle": account.get_billing_cycle_display(),
                    "currency": account.currency,
                    "status": account.get_status_display(),
                    "region": account.region.name if account.region else "N/A",
                }
            )

        return JsonResponse({"accounts": accounts_data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@login_required
def get_account_details_api(request, account_id):
    """API endpoint to get detailed account information"""
    try:
        account = get_object_or_404(Account, id=account_id)
        active_po = account.active_purchase_order

        account_data = {
            "id": account.id,
            "account_id": account.account_id,
            "name": account.name,
            "billing_cycle": account.get_billing_cycle_display(),
            "currency": account.currency,
            "status": account.get_status_display(),
            "region": account.region.name if account.region else "N/A",
            "active_po": active_po.po_number if active_po else None,
            "po_balance": str(active_po.remaining_balance) if active_po else None,
            "contact_email": account.contact_email,
            "contact_phone": account.contact_phone,
        }

        return JsonResponse(account_data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@login_required
def create_billing_run(request):
    """Legacy simple billing run creation (for backward compatibility)"""
    if request.method == "POST":
        customer_id = request.POST.get("customer")
        account_id = request.POST.get("account")
        po_id = request.POST.get("purchase_order")
        amount = request.POST.get("amount")
        billing_date = request.POST.get("billing_date")

        try:
            customer = Customer.objects.get(id=customer_id)
            account = Account.objects.get(id=account_id) if account_id else None
            po = PurchaseOrder.objects.get(id=po_id)

            # Generate unique run ID
            run_id = (
                f"BR-{date.today().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            )

            billing_run = BillingRun.objects.create(
                run_id=run_id,
                customer=customer,
                account=account,
                purchase_order=po,
                amount=float(amount),
                billing_date=billing_date,
                processed_by=request.user,
            )

            # Update PO remaining balance
            po.remaining_balance -= float(amount)
            po.save()

            # Update account status if account is provided
            if account:
                account.update_status()

            messages.success(request, "Billing Run created successfully!")
            return redirect("billing:list")

        except Exception as e:
            messages.error(request, f"Error creating billing run: {str(e)}")

    customers = Customer.objects.filter(is_active=True)
    accounts = Account.objects.filter(is_active=True)
    purchase_orders = PurchaseOrder.objects.filter(status="active")

    context = {
        "customers": customers,
        "accounts": accounts,
        "purchase_orders": purchase_orders,
    }
    return render(request, "billing/create.html", context)


from .models import BandTable, FinalTicket


# @login_required
def get_all_band_data(request):
    """API to retrieve all BandTable JSON data"""
    try:
        band_entries = BandTable.objects.all().order_by("-created_at")

        # Check removed to allow returning empty list instead of 404 if preferred,
        # but keeping your logic:
        if not band_entries.exists():
            return JsonResponse(
                {"success": False, "error": "No band data found"},
                status=404,
            )

        data = []
        for entry in band_entries:
            data.append(
                {
                    "uuid": str(entry.uuid),  # <--- Added UUID here
                    "ticket_number": entry.ticket_number,
                    "customer": entry.customer.name,
                    "account": entry.account.name if entry.account else None,
                    "band_data": entry.band_data,
                    "updated_at": entry.updated_at,
                }
            )

        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Error fetching band data: {e}")
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# @login_required
def get_all_final_data(request):
    """API to retrieve all FinalTicket JSON data"""
    try:
        # Optimized query
        final_entries = (
            FinalTicket.objects.select_related(
                "customer", "account", "initial_ticket", "band"
            )
            .all()
            .order_by("-created_at")
        )

        if not final_entries.exists():
            return JsonResponse(
                {"success": False, "error": "No final ticket data found"},
                status=404,
            )

        data = []
        for entry in final_entries:
            # Safe access for nullable fields
            initial_uuid = (
                str(entry.initial_ticket.uuid) if entry.initial_ticket else None
            )

            # Band details
            band_info = None
            if entry.band:
                band_info = {
                    "uuid": str(entry.band.uuid),
                    "ticket_number": entry.band.ticket_number,
                    "band_data": entry.band.band_data,
                }

            data.append(
                {
                    "uuid": str(entry.uuid),
                    "initial_ticket_uuid": initial_uuid,
                    "band": band_info,  # <--- Changed from rate_card to band
                    "ticket_number": entry.ticket_number,
                    "request_id": entry.request_id,
                    "customer": entry.customer.name,
                    "account": entry.account.name if entry.account else None,
                    "data_table": entry.data_table,
                    "created_at": entry.created_at,
                }
            )

        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Error fetching final ticket data: {e}")
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class BatchStoreBandTableView(View):
    """
    Standard Django View to batch store BandTable records.
    Expects a JSON array of objects.
    Returns UUIDs for created records.
    """

    def post(self, request):
        try:
            payload = json.loads(request.body)

            # Ensure payload is a list
            if not isinstance(payload, list):
                payload = [payload]

            saved_count = 0
            errors = []
            created_items = []  # List to store successfully created items with UUIDs

            for index, item in enumerate(payload):
                try:
                    # Validate required fields
                    if "customer" not in item or "ticket_number" not in item:
                        raise ValueError(f"Missing required fields in item {index}")

                    # Resolve Customer and Account instances
                    customer_instance = get_object_or_404(Customer, pk=item["customer"])

                    account_instance = None
                    if item.get("account"):
                        account_instance = get_object_or_404(
                            Account, pk=item["account"]
                        )

                    # Create Record and capture the instance
                    instance = BandTable.objects.create(
                        customer=customer_instance,
                        account=account_instance,
                        ticket_number=item["ticket_number"],
                        band_data=item.get("band_data", {}),
                    )

                    saved_count += 1

                    # Append the ticket details + new UUID to the response list
                    created_items.append(
                        {
                            "ticket_number": item["ticket_number"],
                            "uuid": str(instance.uuid),
                        }
                    )

                except Exception as row_error:
                    errors.append(f"Row {index}: {str(row_error)}")

            response_data = {
                "success": True,
                "message": f"Successfully saved {saved_count} BandTable records.",
                "created_items": created_items,  # <--- Now sending back UUIDs
                "errors": errors if errors else None,
            }
            return JsonResponse(response_data, status=201)

        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "error": "Invalid JSON format"}, status=400
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class BatchStoreFinalTicketView(View):
    def post(self, request):
        try:
            payload = json.loads(request.body)
            if not isinstance(payload, list):
                payload = [payload]

            saved_count = 0
            errors = []
            created_items = []

            for index, item in enumerate(payload):
                try:
                    # ... (Validation and Customer/Account logic same as before) ...

                    if "customer" not in item or "ticket_number" not in item:
                        raise ValueError(f"Missing required fields")

                    customer_instance = get_object_or_404(Customer, pk=item["customer"])
                    account_instance = None
                    if item.get("account"):
                        account_instance = get_object_or_404(
                            Account, pk=item["account"]
                        )

                    # Resolve InitialTicket
                    initial_ticket_instance = None
                    if item.get("initial_ticket_uuid"):
                        try:
                            initial_ticket_instance = InitialTicket.objects.get(
                                uuid=item["initial_ticket_uuid"]
                            )
                        except InitialTicket.DoesNotExist:
                            pass

                    # Resolve Band (Manually passed UUID)
                    band_instance = None
                    if item.get("band_uuid"):
                        try:
                            band_instance = BandTable.objects.get(
                                uuid=item["band_uuid"]
                            )
                        except BandTable.DoesNotExist:
                            pass

                    # Create Record
                    instance = FinalTicket.objects.create(
                        customer=customer_instance,
                        account=account_instance,
                        ticket_number=item["ticket_number"],
                        request_id=item["request_id"],
                        data_table=item.get("data_table", {}),
                        initial_ticket=initial_ticket_instance,
                        band=band_instance,  # <--- Saving Band
                    )

                    saved_count += 1
                    created_items.append(
                        {
                            "ticket_number": item["ticket_number"],
                            "uuid": str(instance.uuid),
                        }
                    )

                except Exception as row_error:
                    errors.append(f"Row {index}: {str(row_error)}")

            return JsonResponse(
                {
                    "success": True,
                    "message": f"Saved {saved_count} records.",
                    "created_items": created_items,
                },
                status=201,
            )

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)


# @login_required
def get_all_initial_data(request):
    """API to retrieve all InitialTicket JSON data"""
    try:
        initial_entries = InitialTicket.objects.all().order_by("-created_at")

        if not initial_entries.exists():
            return JsonResponse(
                {"success": False, "error": "No initial ticket data found"},
                status=404,
            )

        data = []
        for entry in initial_entries:
            data.append(
                {
                    "uuid": str(entry.uuid),
                    "ticket_number": entry.ticket_number,
                    "request_id": entry.request_id,
                    "customer": entry.customer.name,
                    "account": entry.account.name if entry.account else None,
                    "data_table": entry.data_table,
                    "created_at": entry.created_at,
                }
            )

        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Error fetching initial ticket data: {e}")
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class BatchStoreInitialTicketView(View):
    """
    Standard Django View to batch store InitialTicket records.
    Expects a JSON array of objects.
    Returns UUIDs for created records.
    """

    def post(self, request):
        try:
            payload = json.loads(request.body)

            # Ensure payload is a list
            if not isinstance(payload, list):
                payload = [payload]

            saved_count = 0
            errors = []
            created_items = []  # List to store successfully created items with UUIDs

            for index, item in enumerate(payload):
                try:
                    # Validate required fields
                    if (
                        "customer" not in item
                        or "ticket_number" not in item
                        or "request_id" not in item
                    ):
                        raise ValueError(f"Missing required fields in item {index}")

                    # Resolve Customer and Account instances
                    customer_instance = get_object_or_404(Customer, pk=item["customer"])

                    account_instance = None
                    if item.get("account"):
                        account_instance = get_object_or_404(
                            Account, pk=item["account"]
                        )

                    # Create Record and capture instance
                    instance = InitialTicket.objects.create(
                        customer=customer_instance,
                        account=account_instance,
                        ticket_number=item["ticket_number"],
                        request_id=item["request_id"],
                        data_table=item.get("data_table", {}),
                    )

                    saved_count += 1

                    # Append the ticket details + new UUID to the response list
                    created_items.append(
                        {
                            "ticket_number": item["ticket_number"],
                            "request_id": item["request_id"],
                            "uuid": str(instance.uuid),
                        }
                    )

                except Exception as row_error:
                    errors.append(f"Row {index}: {str(row_error)}")

            response_data = {
                "success": True,
                "message": f"Successfully saved {saved_count} InitialTicket records.",
                "created_items": created_items,
                "errors": errors if errors else None,
            }
            return JsonResponse(response_data, status=201)

        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "error": "Invalid JSON format"}, status=400
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class BatchAssignBandView(View):
    """
    Manually assigns a BandTable entry to a FinalTicket via UUID.
    Payload: [{"final_ticket": "uuid", "band": "uuid"}, ...]
    """

    def post(self, request):
        try:
            payload = json.loads(request.body)
            updated_count = 0

            for item in payload:
                try:
                    ticket = FinalTicket.objects.get(uuid=item.get("final_ticket"))
                    band = BandTable.objects.get(uuid=item.get("band"))

                    ticket.band = band
                    ticket.save()
                    updated_count += 1
                except Exception:
                    continue

            return JsonResponse({"success": True, "updated": updated_count})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class AutoAssignBandView(View):
    """
    Auto-assigns BandTable entries to FinalTickets based on matching 'ticket_number'.
    """

    def post(self, request):
        try:
            payload = json.loads(request.body)
            ticket_uuids = payload.get("final_ticket_uuids", [])

            assigned_count = 0
            results = []

            final_tickets = FinalTicket.objects.filter(uuid__in=ticket_uuids)

            for ticket in final_tickets:
                # Find matching BandTable by ticket_number and customer
                match = (
                    BandTable.objects.filter(
                        ticket_number=ticket.ticket_number, customer=ticket.customer
                    )
                    .order_by("-created_at")
                    .first()
                )  # Get most recent

                if match:
                    ticket.band = match
                    ticket.save(update_fields=["band"])
                    assigned_count += 1
                    results.append(
                        {
                            "ticket": str(ticket.uuid),
                            "status": "Assigned",
                            "band": str(match.uuid),
                        }
                    )
                else:
                    results.append({"ticket": str(ticket.uuid), "status": "No Match"})

            return JsonResponse(
                {"success": True, "assigned_count": assigned_count, "results": results}
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)


# views.py
def comparison_tool(request):
    return render(request, "billing/comparison.html")
