import logging
import requests
from decouple import config
from django.db.models import F

from apps.purchase_orders.models import PurchaseOrder

log = logging.getLogger('dashboard_n8n_notifications')

def send_kpi_notifications_to_n8n():
    """
    Checks PO utilization and sends batched notifications to n8n
    when utilization drops below 25%, 50%, 75%, or 90%.
    """
    THRESHOLDS = [25, 50, 75, 90]
    notifications = []  # Store all triggered notifications

    # Get active purchase orders and calculate utilization
    pos = PurchaseOrder.objects.filter(status='active').annotate(
        utilization_percent=(F('spent_amount') / F('total_amount')) * 100
    )

    webhook_url = config('N8N_DASHBOARD_KPI_WEBHOOK', default=None)
    if not webhook_url or webhook_url.lower() == 'none':
        log.warning("⚠️ N8N webhook not configured, skipping notifications.")
        return

    for po in pos:
        utilization = float(po.utilization_percent or 0)
        remaining = 100 - utilization

        for threshold in THRESHOLDS:
            if remaining < threshold:
                notifications.append({
                    "po_number": po.po_number,
                    "customer": po.customer.name if po.customer else "N/A",
                    "utilization_percent": round(utilization, 2),
                    "remaining_percent": round(remaining, 2),
                    "threshold_triggered": f"<{threshold}",
                })
                # Once triggered for a threshold, no need to trigger smaller ones
                break

    # Only send to n8n if there are notifications
    if notifications:
        try:
            payload = {"notifications": notifications}
            response = requests.post(webhook_url, json=payload, timeout=15)
            response.raise_for_status()
            log.info(f"✅ Sent {len(notifications)} KPI notifications to n8n successfully.")
        except Exception as e:
            log.error(f"❌ Failed to send KPI batch notification: {e}")
    else:
        log.info("ℹ️ No KPI thresholds triggered this run.")
