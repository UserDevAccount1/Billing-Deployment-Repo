from django.urls import path
from . import views

app_name = "billing"

urlpatterns = [
    # Main billing run pages
    path("", views.billing_run_list, name="list"),
    path("create/", views.create_billing_run, name="create"),
    path("create-wizard/", views.create_billing_run_wizard, name="create_wizard"),
    path("test/", views.test_page, name="test"),
    # API endpoints for AJAX calls (Existing)
    path(
        "api/customers/<int:customer_id>/accounts/",
        views.get_customer_accounts_api,
        name="customer_accounts_api",
    ),
    path(
        "api/accounts/<int:account_id>/",
        views.get_account_details_api,
        name="account_details_api",
    ),
    # API endpoints for Batch Storage (From previous step)
    path(
        "api/band-table/batch/",
        views.BatchStoreBandTableView.as_view(),
        name="band_table_batch",
    ),
    path(
        "api/final-ticket/batch/",
        views.BatchStoreFinalTicketView.as_view(),
        name="final_ticket_batch",
    ),
    # API endpoints for Retrieving Ticket Data (New)
    path(
        "api/band-data/",
        views.get_all_band_data,
        name="get_band_data",
    ),
    path(
        "api/final-data/",
        views.get_all_final_data,
        name="get_final_data",
    ),
]
