from django.urls import path
from . import views

app_name = 'purchase_orders'

urlpatterns = [
    # Main pages
    path('', views.purchase_order_list, name='list'),

    # PO PDF Upload
    path('api/upload-po/', views.upload_po_attachment, name='upload_po'),
    path('api/<int:attachment_id>/download/', views.download_po_attachment, name='download_po'),
    path('api/<int:attachment_id>/delete/', views.delete_po_attachment, name='delete_po'),

    # CSV Upload
    path('upload-csv/', views.upload_csv, name='upload_csv'),
    path('bulk-create-from-csv/', views.bulk_create_pos_from_csv, name='bulk_create_from_csv'),

    # API endpoints
    path('api/create/', views.create_purchase_order_api, name='create_po_api'),
    path('api/<int:pk>/', views.get_purchase_order_api, name='get_po_api'),
    path('api/<int:pk>/update/', views.update_purchase_order_api, name='update_po_api'),
    path('api/po/<int:pk>/delete/', views.delete_purchase_order_api, name='delete_po_api'),
    
    # Export
    path('export/', views.export_purchase_orders, name='export'),

    # Currency Exchange
    path('currency-exchange/', views.currency_exchange, name='currency_exchange'),

    # Notifications
    path('api/notifications/', views.get_notifications_api, name='get_notifications'),
    path('api/notifications/<int:notification_id>/read/', views.mark_notification_read_api, name='mark_notification_read'),
    path('api/notifications/mark-all-read/', views.mark_all_notifications_read_api, name='mark_all_notifications_read'),

    # ============================================================
    # n8n AUTOMATION BRIDGE
    # ============================================================
    path('api/n8n-bridge/', views.n8n_po_bridge, name='n8n_po_bridge'),
]