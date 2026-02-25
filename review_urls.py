from django.urls import path
from . import admin

urlpatterns = [
    path('pending-review/', admin.pending_review_view, name='pending-review'),
    path('review/<int:po_id>/', admin.review_action, name='review-action'),
]