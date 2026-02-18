from django.contrib import admin
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse, path
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q
from django.utils import timezone
from decimal import Decimal  # 🔥 IMPORT ADDED
from .models import BillingRun, BillingRunLineItem, BillingRunAttachment
from apps.purchase_orders.models import PurchaseOrder

# 🔥 CUSTOM REVIEW VIEWS FOR PENDING POS
@staff_member_required
def pending_review_view(request):
    """Custom admin view for POs pending review"""
    pending_pos = PurchaseOrder.objects.filter(
        Q(review_status='pending_review') | Q(requires_review=True)
    ).order_by('-created_at')
    
    context = {
        'pending_pos': pending_pos,
        'title': 'Purchase Orders Pending Review'
    }
    return render(request, 'admin/purchase_orders/pending_review.html', context)

def review_action(request, po_id):
    if request.method == 'POST':
        po = PurchaseOrder.objects.get(id=po_id)
        action = request.POST.get('action')
        amount = request.POST.get('amount')
        
        if action == 'approve' and amount:
            # 🔥 FIXED: Use Decimal instead of float
            po.total_amount = Decimal(amount)
            po.review_status = 'approved'
            po.requires_review = False
            po.reviewed_at = timezone.now()
            po.reviewed_by = request.user
            po.save()
            
            # Update any pending billing runs
            po.billingrun_set.filter(status='pending_po_review').update(status='completed')
            
            messages.success(request, f'PO {po.po_number} approved with amount {amount}')
        elif action == 'reject':
            po.review_status = 'rejected'
            po.save()
            messages.warning(request, f'PO {po.po_number} rejected')
            
    return HttpResponseRedirect(reverse('admin:purchase_orders_pending_review'))


class BillingRunLineItemInline(admin.TabularInline):
    model = BillingRunLineItem
    extra = 0
    readonly_fields = ['total_amount', 'created_at']
    fields = ['description', 'quantity', 'unit_rate', 'total_amount', 'ticket_reference', 'work_date', 'category']

class BillingRunAttachmentInline(admin.TabularInline):
    model = BillingRunAttachment
    extra = 0
    readonly_fields = ['uploaded_at', 'uploaded_by', 'file_type']
    fields = ['file', 'original_filename', 'file_type', 'uploaded_at', 'uploaded_by']

@admin.register(BillingRun)
class BillingRunAdmin(admin.ModelAdmin):
    list_display = [
        'run_id', 'get_customer_account_display', 'amount', 
        'billing_period', 'status', 'billing_type', 'created_at'
    ]
    list_filter = [
        'status', 'billing_type', 'created_at', 'billing_date',
        'customer', 'account__region'
    ]
    search_fields = [
        'run_id', 'customer__name', 'customer__code',
        'account__name', 'account__account_id',
        'purchase_order__po_number'
    ]
    readonly_fields = [
        'created_at', 'processed_by', 'processed_at', 
        'period_days', 'billing_period'
    ]
    raw_id_fields = ['customer', 'account', 'purchase_order', 'rate_card_applied']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('run_id', 'customer', 'account', 'purchase_order')
        }),
        ('Billing Details', {
            'fields': (
                'amount', 'billing_date', 'billing_start_date', 
                'billing_end_date', 'billing_period', 'period_days'
            )
        }),
        ('Processing Information', {
            'fields': (
                'status', 'billing_type', 'rate_card_applied',
                'tickets_count', 'processed_at'
            )
        }),
        ('Files', {
            'fields': ('tickets_file', 'output_file'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_at', 'processed_by'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [BillingRunLineItemInline, BillingRunAttachmentInline]
    
    def get_customer_account_display(self, obj):
        return obj.get_customer_account_display()
    get_customer_account_display.short_description = 'Customer / Account'
    get_customer_account_display.admin_order_field = 'customer__name'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.processed_by = request.user
        super().save_model(request, obj, form, change)

    # 🔥 Add custom URLs to this admin class
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('pending-review/', self.admin_site.admin_view(pending_review_view), name='purchase_orders_pending_review'),
            path('review/<int:po_id>/', self.admin_site.admin_view(review_action), name='purchase_orders_review_action'),
        ]
        return custom_urls + urls


@admin.register(BillingRunLineItem)
class BillingRunLineItemAdmin(admin.ModelAdmin):
    list_display = [
        'billing_run', 'description', 'quantity', 
        'unit_rate', 'total_amount', 'work_date'
    ]
    list_filter = ['work_date', 'category', 'created_at']
    search_fields = [
        'billing_run__run_id', 'description', 
        'ticket_reference', 'category'
    ]
    readonly_fields = ['created_at']
    raw_id_fields = ['billing_run']
    
    fieldsets = (
        ('Billing Run', {
            'fields': ('billing_run',)
        }),
        ('Line Item Details', {
            'fields': (
                'description', 'quantity', 'unit_rate', 
                'total_amount', 'category'
            )
        }),
        ('Reference Information', {
            'fields': ('ticket_reference', 'work_date')
        }),
        ('System Information', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

@admin.register(BillingRunAttachment)
class BillingRunAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'billing_run', 'original_filename', 'file_type',
        'uploaded_at', 'uploaded_by'
    ]
    list_filter = ['file_type', 'uploaded_at']
    search_fields = [
        'billing_run__run_id', 'original_filename'
    ]
    readonly_fields = ['uploaded_at', 'file_type']
    raw_id_fields = ['billing_run', 'uploaded_by']
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
            # Auto-detect file type from filename
            if obj.file:
                import os
                _, ext = os.path.splitext(obj.file.name)
                obj.file_type = ext.lower().replace('.', '')
        super().save_model(request, obj, form, change)