from django.urls import path
from . import views

urlpatterns = [
    # PO Review API endpoints
    path('pending-pos/', views.get_pending_pos, name='api_pending_pos'),
    path('purchase-orders/', views.get_all_purchase_orders, name='api_purchase_orders'),
    path('approve-po/<int:po_id>/', views.approve_po, name='api_approve_po'),
    path('reject-po/<int:po_id>/', views.reject_po, name='api_reject_po'),
    path('dashboard-stats/', views.get_dashboard_stats, name='api_dashboard_stats'),

    # Monitor / Workflow API endpoints
    path("upload-zip/", views.upload_zip, name="upload_zip"),
    path("list-excels/", views.list_last_month_excels, name="list_excels"),
    path('get_workflow_execution_rows/', views.get_workflow_execution_rows, name="get_workflow_execution_rows"),
    path("workflow-report/", views.workflow_report, name="workflow_report"),
    path("remove-workflow-cycle/", views.remove_workflow_cycle, name="remove_workflow_cycle"),
]
