# apps/exchange_rates/models.py
from django.db import models
from django.contrib.auth.models import User

class ExchangeRate(models.Model):
    currency_code = models.CharField(max_length=10)         # e.g. "USD", "BRL"
    currency_name = models.CharField(max_length=100)        # e.g. "Brazilian Real"
    usd_per_unit = models.DecimalField(max_digits=18, decimal_places=10)
    source = models.CharField(max_length=100, default="Excis UK")
    effective_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['currency_code']

    def __str__(self):
        return f"{self.currency_code} - {self.usd_per_unit}"