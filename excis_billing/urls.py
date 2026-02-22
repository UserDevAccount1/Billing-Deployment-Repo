from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

# Import custom review views
from apps.billing.admin import pending_review_view, review_action

urlpatterns = [
    # Custom admin URLs (place these FIRST to avoid catch-all)
    path('admin/pending-review/', pending_review_view, name='purchase_orders_pending_review'),
    path('admin/review/<int:po_id>/', review_action, name='purchase_orders_review_action'),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('billing_api.urls')),
    
    # Other app URLs
    path('accounts/', include('apps.accounts.urls')),
    path('dashboard/', include('apps.dashboard.urls')),
    path('customers/', include('apps.customers.urls')),
    path('purchase-orders/', include('apps.purchase_orders.urls')),
    path('billing/', include('apps.billing.urls')),
    path('rate-cards/', include('apps.rate_cards.urls')),
    path('exchange-rates/', include('apps.exchange_rates.urls')),
    path('monitor/', include('apps.monitor.urls')),
    
    # Home redirect
    path('', lambda request: redirect('dashboard:home')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)