# apps/exchange_rates/urls.py
from django.urls import path
from . import views

app_name = 'exchange_rates'

urlpatterns = [
    path('', views.exchange_rate_list, name='list'),
    path('upload_csv/', views.upload_exchange_rates, name='upload_exchange_rates'),
    path('api/', views.exchange_rate_api, name='api'),
    path('api/<int:pk>/', views.exchange_rate_detail_api, name='api_detail'),
]
