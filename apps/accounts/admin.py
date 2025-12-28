from django.contrib import admin

# Register your models here.
from .models import UserRole, UserProfile

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'status', 'last_login_display', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'role__name')
    list_filter = ('status', 'role')
    readonly_fields = ('created_at', 'updated_at', 'last_login_display', 'created_by')
    filter_horizontal = ('access_rights',)