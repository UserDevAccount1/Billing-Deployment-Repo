from django.urls import path
from . import views

urlpatterns = [
    path('billing/', views.billing_api, name='billing-api'),
]

