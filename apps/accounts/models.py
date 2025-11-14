from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserRole(models.Model):
    """User roles with predefined access rights"""
    ROLE_CHOICES = [
        ('system_admin', 'System Admin'),
        ('billing_manager', 'Billing Manager'),
        ('billing_analyst', 'Billing Analyst'),
        ('rate_card_manager', 'Rate Card Manager'),
        ('po_team', 'PO Team'),
        ('approver', 'Approver'),
        ('read_only_auditor', 'Read-Only Auditor'),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'

    def __str__(self):
        return self.get_name_display()

    @classmethod
    def get_default_rights(cls, role_name):
        """Return default access rights for a given role"""
        rights_mapping = {
            'system_admin': [
                'Full access to all modules (tickets, rate cards, PO DB, approvals, billing files)',
                'Manage user accounts, roles, permissions',
                'Configure integrations (ticketing system, Xero, email automation, etc.)',
                'Audit logs and troubleshooting'
            ],
            'billing_manager': [
                'Oversee all billing files (draft → approval → final release)',
                'Adjust billing records (within rules) before submission',
                'Review and reconcile ticket data vs. PO DB vs. rate card',
                'Send billing files for approval',
                'Lock billing cycle once approved'
            ],
            'billing_analyst': [
                'View tickets and timesheets pulled from systems',
                'Generate draft billing files based on rate cards',
                'Cross-check data with PO DB',
                'Flag discrepancies to Billing Manager',
                'Cannot release or approve billing files'
            ],
            'rate_card_manager': [
                'Maintain rate cards per customer/region/service type',
                'Version control for rate card changes',
                'Map ticket categories to correct rate card entries',
                'Read-only access to PO DB for cross-checking'
            ],
            'po_team': [
                'Maintain and update PO database (PO numbers, validity, balances)',
                'Approve or reject billing items that don\'t align with active POs',
                'Provide PO-related clarifications to Billing Analysts/Managers',
                'No access to rate cards'
            ],
            'approver': [
                'Review generated billing files',
                'Approve / reject billing file before release to customer',
                'Add comments/notes on rejections',
                'Cannot edit billing files, only accept/reject'
            ],
            'read_only_auditor': [
                'Read-only access to billing files, approval logs, PO DB',
                'Download reports for audit purposes',
                'Cannot edit or approve'
            ]
        }
        return rights_mapping.get(role_name, [])


class AccessRight(models.Model):
    """Individual access rights that can be assigned to users"""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)  # e.g., 'billing', 'po', 'rate_card'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Access Right'
        verbose_name_plural = 'Access Rights'
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Extended user profile with role and custom access rights"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    access_rights = models.ManyToManyField(AccessRight, blank=True)
    custom_rights = models.JSONField(default=dict, blank=True)  # For user-specific right toggles
    last_login_display = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_profiles')

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role}"

    def get_all_rights(self):
        """Get all access rights for this user (role-based + custom)"""
        rights = set()

        # Add role-based rights
        if self.role:
            default_rights = UserRole.get_default_rights(self.role.name)
            rights.update(default_rights)

        # Add custom assigned rights
        rights.update([right.name for right in self.access_rights.all()])

        # Apply custom right toggles
        if self.custom_rights:
            for right, enabled in self.custom_rights.items():
                if enabled:
                    rights.add(right)
                else:
                    rights.discard(right)

        return list(rights)

    def has_right(self, right_name):
        """Check if user has a specific access right"""
        return right_name in self.get_all_rights()

    def is_active_user(self):
        """Check if user profile is active"""
        return self.status == 'active' and self.user.is_active


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create user profile when user is created"""
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()