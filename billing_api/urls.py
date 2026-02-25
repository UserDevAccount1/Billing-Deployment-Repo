from django.urls import path
from . import views

urlpatterns = [
    path('billing/', views.billing_api, name='billing-api'),
    path('pending-pos/', views.get_pending_pos, name='api_pending_pos'),
    path('approve-po/<int:po_id>/', views.approve_po, name='api_approve_po'),
    path('reject-po/<int:po_id>/', views.reject_po, name='api_reject_po'),
    path('dashboard-stats/', views.get_dashboard_stats, name='api_dashboard_stats'),
    path('purchase-orders/', views.get_all_purchase_orders, name='api_purchase_orders'),
]
