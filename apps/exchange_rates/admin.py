# apps/exchange_rates/admin.py
from django.contrib import admin
from .models import ExchangeRate

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('currency_code', 'currency_name', 'usd_per_unit', 'source', 'effective_date', 'created_at')
    search_fields = ('currency_code', 'currency_name')
