"""
URL configuration for excis_billing project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', include('apps.billing.review_urls')),
    path('admin/', admin.site.urls),
    path('accounts/', include('apps.accounts.urls')),
    path('dashboard/', include('apps.dashboard.urls')),
    path('customers/', include('apps.customers.urls')),
    path('purchase-orders/', include('apps.purchase_orders.urls')),
    path('billing/', include('apps.billing.urls')),
    path('rate-cards/', include('apps.rate_cards.urls')),
    path('exchange-rates/', include('apps.exchange_rates.urls')),
    path('monitor/', include('apps.monitor.urls')),
    path('', lambda request: redirect('dashboard:home')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)