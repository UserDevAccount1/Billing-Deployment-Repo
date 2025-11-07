from __future__ import annotations
import uuid
from decimal import Decimal
from datetime import timedelta, date
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.customers.models import Customer
from apps.purchase_orders.models import PurchaseOrder
from apps.rate_cards.models import DedicatedRate, RateCard, ServiceRate, ScheduledRate, ProjectRate, DispatchRate


if not RateCard or not ServiceRate:
    raise ImportError("Could not import RateCard/ServiceRate. Adjust import paths in the command.")

User = get_user_model()


class Command(BaseCommand):
    help = "Seed DB with sample Customers, PurchaseOrders, RateCards and rate models."

    def handle(self, *args, **options):
        with transaction.atomic():
            # 1) pick or create a staff user
            user = User.objects.filter(is_staff=True).first()
            if not user:
                user, created = User.objects.get_or_create(username="seed_user", defaults={
                    "email": "seed_user@example.com",
                    "is_staff": True,
                })
                if created:
                    user.set_password("password")
                    user.save()
                    self.stdout.write(self.style.WARNING("Created seed_user with password 'password' — change immediately."))
            else:
                self.stdout.write(self.style.NOTICE(f"Using existing staff user: {user.username}"))

            # 2) sample customers
            sample_customers = [
                {"code": "HCL", "name": "HCL Technologies", "email": "finance@hcl.com"},
                {"code": "Cognizant", "name": "Cognizant", "email": "finance@cognizant.com"},
                {"code": "TCS", "name": "Tata Consultancy Services", "email": "finance@tcs.com"},
                {"code": "LEN-TH", "name": "Lenovo Thailand", "email": "finance.th@lenovo.com"},
                {"code": "ACME", "name": "Acme Corp", "email": "finance@acme.example"},
            ]

            created_customers = []
            for s in sample_customers:
                if Customer:
                    cust, created = Customer.objects.get_or_create(code=s["code"], defaults={
                        "name": s["name"],
                        "email": s["email"],
                        "created_by": user if hasattr(Customer, "created_by") else None,
                    })
                    created_customers.append(cust)
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Created Customer: {cust}"))
                    else:
                        self.stdout.write(self.style.NOTICE(f"Customer exists: {cust}"))
                else:
                    self.stdout.write(self.style.WARNING("Customer model not available; cannot create sample customers."))
                    break

            # 3) create minimal PurchaseOrders (one per created customer) if PurchaseOrder model exists
            created_pos = []
            if PurchaseOrder:
                today = timezone.now().date()
                for i, cust in enumerate(created_customers):
                    po_number = f"PO-{cust.code}-{uuid.uuid4().hex[:6].upper()}"
                    valid_from = today
                    valid_until = today + timedelta(days=365)
                    excis_entity = f"E{i+1}"

                    po_defaults = {
                        "customer": cust,
                        "currency": "USD",
                        "total_amount": Decimal("100000.00"),
                        "spent_amount": Decimal("0.00"),
                        "valid_from": valid_from,
                        "valid_until": valid_until,
                        "excis_entity": excis_entity,
                        "created_by": user if PurchaseOrder._meta.get_field("created_by").remote_field.model == User else None,
                    }

                    # Some PurchaseOrder fields may be required; attempt get_or_create by po_number
                    po, created = PurchaseOrder.objects.get_or_create(po_number=po_number, defaults=po_defaults)
                    created_pos.append(po)
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Created PurchaseOrder: {po_number} -> entity {excis_entity}"))
                    else:
                        self.stdout.write(self.style.NOTICE(f"PurchaseOrder exists: {po_number}"))
            else:
                self.stdout.write(self.style.WARNING("PurchaseOrder model not available; skipping PO creation."))

            # 4) create 5 RateCards, each linked to a PO (if PO exists), else entity left None
            if not created_customers:
                self.stdout.write(self.style.ERROR("No customers available, aborting RateCard creation."))
                return

            ratecards = []
            currencies = ["USD", "EUR", "USD", "THB", "GBP"]
            regions = ["EMEA", "APAC", "NA", "APAC", "EMEA"]
            countries = ["Germany", "India", "USA", "Thailand", "UK"]
            suppliers = ["Vendor A", "Vendor B", "Vendor C", "Vendor TH", "Vendor D"]
            payments = ["30 Days", "45 Days", "30 Days", "30 Days", "60 Days"]

            for i, cust in enumerate(created_customers):
                rc_defaults = {
                    "created_by": user,
                    "region": regions[i],
                    "country": countries[i],
                    "supplier": suppliers[i],
                    "currency": currencies[i],
                    # entity will be set to a PurchaseOrder if available
                    "payment_terms": payments[i],
                    "status": "Active",
                }
                # attach a PO if available
                entity_po = created_pos[i] if i < len(created_pos) else None
                if entity_po:
                    rc_defaults["entity"] = entity_po

                rc, created = RateCard.objects.get_or_create(customer=cust, defaults=rc_defaults)
                ratecards.append(rc)
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created RateCard id={rc.id} for {cust}"))
                else:
                    self.stdout.write(self.style.NOTICE(f"RateCard exists id={rc.id} for {cust}"))

            # helper functions to populate different rate models
            def create_dedicated_rates(rc, base_with=26000, base_without=23000):
                if not DedicatedRate:
                    return []
                bands = ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4']
                objs = []
                for j, b in enumerate(bands):
                    with_val = Decimal(base_with + j * 2000)
                    without_val = Decimal(base_without + j * 1800)
                    objs.append(DedicatedRate.objects.create(
                        rate_card=rc, category=b, rate_type='With', rate_value=with_val, created_by=user
                    ))
                    objs.append(DedicatedRate.objects.create(
                        rate_card=rc, category=b, rate_type='Without', rate_value=without_val, created_by=user
                    ))
                return objs

            def create_scheduled_rates(rc, base=300):
                if not ScheduledRate:
                    return []
                groups = [
                    ("Full Day Visit (8hrs)", ['Band 0', 'Band 1', 'Band 2']),
                    ("1/2 Day Visit (4hrs)", ['Band 0', 'Band 1', 'Band 2']),
                ]
                objs = []
                for g_idx, (title, bands) in enumerate(groups):
                    for k, b in enumerate(bands):
                        val = Decimal(base + (g_idx * 50) + k * 20)
                        objs.append(ScheduledRate.objects.create(
                            rate_card=rc, category=title, rate_type=b, rate_value=val, created_by=user
                        ))
                return objs

            def create_dispatch_rates(rc, base_incident=100, base_imac=200):
                if not DispatchRate:
                    return []
                groups = [
                    ("Dispatch Ticket (Incident)", ['4 hour', 'SBD', 'NBD', '2 BD', '3 BD', 'Additional Hour']),
                    ("Dispatch Ticket (IMAC)", ['2 BD', '3 BD', '4 BD']),
                ]
                objs = []
                for i_b, b in enumerate(groups[0][1]):
                    val = Decimal(base_incident + i_b * 50)
                    objs.append(DispatchRate.objects.create(
                        rate_card=rc, category=groups[0][0], rate_type=b, rate_value=val, created_by=user
                    ))
                for i_b, b in enumerate(groups[1][1]):
                    val = Decimal(base_imac + i_b * 75)
                    objs.append(DispatchRate.objects.create(
                        rate_card=rc, category=groups[1][0], rate_type=b, rate_value=val, created_by=user
                    ))
                return objs

            def create_project_rates(rc, base_short=5000, base_long=4500):
                if not ProjectRate:
                    return []
                objs = []
                for idx in range(5):
                    val = Decimal(base_short + idx * 500)
                    objs.append(ProjectRate.objects.create(
                        rate_card=rc, category="Short Term (Up to 3 months)", rate_type=f"Band {idx}", rate_value=val, created_by=user
                    ))
                for idx in range(5):
                    val = Decimal(base_long + idx * 450)
                    objs.append(ProjectRate.objects.create(
                        rate_card=rc, category="Long Term (more than 3 months)", rate_type=f"Band {idx}", rate_value=val, created_by=user
                    ))
                return objs

            def create_service_rates(rc):
                if not ServiceRate:
                    return []
                objs = []
                objs.append(ServiceRate.objects.create(
                    rate_card=rc, category="Dispatch", region=rc.country or rc.region, rate_type="hourly", rate_value=Decimal(850),
                    after_hours_multiplier=Decimal('1.5'), weekend_multiplier=Decimal('2.0'), travel_charge=Decimal('0.00'), created_by=user
                ))
                objs.append(ServiceRate.objects.create(
                    rate_card=rc, category="FTE", region=rc.country or rc.region, rate_type="monthly", rate_value=Decimal(60000),
                    remarks="Level 2 engineer full-time placement", created_by=user
                ))
                objs.append(ServiceRate.objects.create(
                    rate_card=rc, category="Scheduled Visit", region=rc.country or rc.region, rate_type="day", rate_value=Decimal(3200), created_by=user
                ))
                return objs

            # populate each ratecard
            for idx, rc in enumerate(ratecards):
                dw = create_dedicated_rates(rc, base_with=26000 + idx * 1000, base_without=23000 + idx * 800)
                sch = create_scheduled_rates(rc, base=300 + idx * 10)
                dis = create_dispatch_rates(rc, base_incident=100 + idx * 10, base_imac=200 + idx * 15)
                proj = create_project_rates(rc, base_short=5000 + idx * 200, base_long=4500 + idx * 150)
                svc = create_service_rates(rc)

                self.stdout.write(self.style.SUCCESS(
                    f"RateCard id={rc.id}: created {len(dw)} dedicated, {len(sch)} scheduled, {len(dis)} dispatch, {len(proj)} project, {len(svc)} service rates."
                ))

            self.stdout.write(self.style.SUCCESS("Seeding complete."))
