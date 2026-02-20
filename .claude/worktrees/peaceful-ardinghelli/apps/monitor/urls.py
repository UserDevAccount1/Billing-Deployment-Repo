from django.urls import path
from . import views

app_name = 'monitor'

urlpatterns = [
    path('', views.monitor_dashboard, name='dashboard'),
    path('api/status/', views.get_pipeline_status, name='api_status'),
    path('api/control/', views.control_pipeline, name='api_control'),
    path('api/logs/', views.get_pipeline_logs, name='api_logs'),
]
