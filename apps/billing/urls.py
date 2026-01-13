from django.urls import path
from . import views

app_name = "billing"

urlpatterns = [
    # Main billing run pages
    path("", views.billing_run_list, name="list"),
    # path("create/", views.create_billing_run, name="create"),
    path("create-wizard/", views.create_billing_run_wizard, name="create_wizard"),
    path("create/", views.test_page, name="create"),
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
    # --- BATCH STORAGE ENDPOINTS ---
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
    path(
        "api/initial-ticket/batch/",
        views.BatchStoreInitialTicketView.as_view(),
        name="initial_ticket_batch",
    ),
    # --- DATA RETRIEVAL ENDPOINTS ---
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
    path(
        "api/initial-data/",
        views.get_all_initial_data,
        name="get_initial_data",
    ),
    # --- ASSIGNMENT ENDPOINTS ---
    path(
        "api/batch-assign-bands/",
        views.BatchAssignBandView.as_view(),
        name="batch_assign_bands",
    ),
    path(
        "api/auto-assign-bands/",
        views.AutoAssignBandView.as_view(),
        name="auto_assign_bands",
    ),
    path("comparison/", views.comparison_tool, name="comparison_tool"),
]
