from django.urls import path
from . import views

urlpatterns = [
    path("upload-zip/", views.upload_zip, name="upload_zip"),
     path("list-excels/", views.list_last_month_excels, name="list_excels"),

     path('get_workflow_execution_rows/', views.get_workflow_execution_rows, name="get_workflow_execution_rows"),
     path("workflow-report/", views.workflow_report, name="workflow_report"),
     path("remove-workflow-cycle/", views.remove_workflow_cycle, name="remove_workflow_cycle"),
]
