from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User Management
    path('users/', views.UserManagementView.as_view(), name='user_management'),
    path('users/add/', views.user_add_edit, name='user_add'),
    path('users/<int:user_id>/edit/', views.user_add_edit, name='user_edit'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),

    # API Endpoints
    path('api/users/create/', views.user_create_api, name='user_create_api'),
    path('api/users/<int:user_id>/', views.user_detail_api, name='user_detail_api'),
    path('api/users/<int:user_id>/update/', views.user_update_api, name='user_update_api'),
    path('api/users/<int:user_id>/rights/', views.update_user_rights, name='update_user_rights'),
    path('api/roles/<str:role_name>/rights/', views.get_role_rights_api, name='get_role_rights'),
]