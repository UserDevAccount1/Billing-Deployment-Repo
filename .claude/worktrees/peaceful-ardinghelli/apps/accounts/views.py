from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.db.models import Q
import json

from .forms import CustomUserCreationForm, CustomLoginForm, UserManagementForm
from .models import UserProfile, UserRole, AccessRight


class CustomLoginView(LoginView):
    form_class = CustomLoginForm
    template_name = 'accounts/login.html'
    success_url = reverse_lazy('dashboard:home')

    def form_invalid(self, form):
        messages.error(self.request, 'Invalid username or password.')
        return super().form_invalid(form)

    def form_valid(self, form):
        """Update last login display on successful login"""
        response = super().form_valid(form)
        user = form.get_user()
        if hasattr(user, 'profile'):
            from django.utils import timezone
            user.profile.last_login_display = timezone.now()
            user.profile.save()
        return response


class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'accounts/signup.html'
    success_url = reverse_lazy('accounts:login')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Account created successfully! You can now login.')
        login(self.request, self.object)
        return redirect('dashboard:home')


def is_admin(user):
    """Check if user is admin or has user management rights"""
    if user.is_superuser:
        return True
    if hasattr(user, 'profile') and user.profile.role:
        return user.profile.role.name == 'system_admin'
    return False


class UserManagementView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """Main user management dashboard"""
    model = User
    template_name = 'accounts/user_management.html'
    context_object_name = 'users'
    paginate_by = 50

    def test_func(self):
        return is_admin(self.request.user)

    def get_queryset(self):
        queryset = User.objects.select_related('profile', 'profile__role').all()

        # Apply filters
        role_filter = self.request.GET.get('role')
        status_filter = self.request.GET.get('status')
        search = self.request.GET.get('search')

        if role_filter:
            queryset = queryset.filter(profile__role__name=role_filter)

        if status_filter:
            queryset = queryset.filter(profile__status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )

        return queryset.order_by('-profile__created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['roles'] = UserRole.ROLE_CHOICES
        context['total_users'] = User.objects.count()
        context['active_users'] = User.objects.filter(profile__status='active').count()
        context['inactive_users'] = User.objects.filter(profile__status='inactive').count()

        # Get filter values for preserving state
        context['current_role'] = self.request.GET.get('role', '')
        context['current_status'] = self.request.GET.get('status', '')
        context['current_search'] = self.request.GET.get('search', '')

        return context


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def user_create_api(request):
    """API endpoint to create user via modal"""
    try:
        # Get form data
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password = request.POST.get('password')
        role_name = request.POST.get('role')
        status = request.POST.get('status', 'active')
        custom_rights_json = request.POST.get('custom_rights', '{}')

        print("role_name", role_name)

        # Validate required fields
        if not all([username, email, first_name, last_name, password, role_name]):
            return JsonResponse({
                'success': False,
                'error': 'All fields are required'
            }, status=400)

        # Check if username exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already exists'
            }, status=400)

        # Check if email exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'error': 'Email already exists'
            }, status=400)

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )

        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)

        # Set role
        try:
            role = UserRole.objects.get(name=role_name)
            profile.role = role
        except UserRole.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Invalid role selected'
            }, status=400)

        # Set status
        profile.status = status

        # Set custom rights
        try:
            custom_rights = json.loads(custom_rights_json)
            profile.custom_rights = custom_rights
        except json.JSONDecodeError:
            profile.custom_rights = {}

        profile.created_by = request.user
        profile.save()

        return JsonResponse({
            'success': True,
            'message': f'User {user.get_full_name()} created successfully',
            'user_id': user.id
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def user_update_api(request, user_id):
    """API endpoint to update user via modal"""
    try:
        user = get_object_or_404(User, id=user_id)
        profile = user.profile if hasattr(user, 'profile') else None

        if not profile:
            return JsonResponse({
                'success': False,
                'error': 'User profile not found'
            }, status=404)

        # Get form data
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password = request.POST.get('password')
        role_name = request.POST.get('role')
        status = request.POST.get('status', 'active')
        custom_rights_json = request.POST.get('custom_rights', '{}')

        # Validate required fields
        if not all([username, email, first_name, last_name, role_name]):
            return JsonResponse({
                'success': False,
                'error': 'All fields except password are required'
            }, status=400)

        # Check username uniqueness (exclude current user)
        if User.objects.filter(username=username).exclude(id=user_id).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already exists'
            }, status=400)

        # Check email uniqueness (exclude current user)
        if User.objects.filter(email=email).exclude(id=user_id).exists():
            return JsonResponse({
                'success': False,
                'error': 'Email already exists'
            }, status=400)

        # Update user
        user.username = username
        user.email = email
        user.first_name = first_name
        user.last_name = last_name

        # Update password if provided
        if password:
            user.set_password(password)

        user.save()

        # Update profile
        try:
            role = UserRole.objects.get(name=role_name)
            profile.role = role
        except UserRole.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Invalid role selected'
            }, status=400)

        profile.status = status
        user.is_active = (status == 'active')
        user.save()

        # Update custom rights
        try:
            custom_rights = json.loads(custom_rights_json)
            profile.custom_rights = custom_rights
        except json.JSONDecodeError:
            profile.custom_rights = {}

        profile.save()

        return JsonResponse({
            'success': True,
            'message': f'User {user.get_full_name()} updated successfully',
            'user_id': user.id
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@user_passes_test(is_admin)
@require_http_methods(["GET", "POST"])
def user_add_edit(request, user_id=None):
    """Add or edit user"""
    user_obj = None
    if user_id:
        user_obj = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = UserManagementForm(request.POST, instance=user_obj)
        if form.is_valid():
            user = form.save(commit=False)

            # Set password for new users
            if not user_id and form.cleaned_data.get('password'):
                user.set_password(form.cleaned_data['password'])

            user.save()

            # Update or create profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = form.cleaned_data.get('role')
            profile.status = form.cleaned_data.get('status', 'active')

            # Handle custom rights
            custom_rights = form.cleaned_data.get('custom_rights', {})
            profile.custom_rights = custom_rights

            if created:
                profile.created_by = request.user

            profile.save()

            # Handle access rights
            if 'access_rights' in form.cleaned_data:
                profile.access_rights.set(form.cleaned_data['access_rights'])

            action = 'updated' if user_id else 'created'
            messages.success(request, f'User {user.get_full_name()} has been {action} successfully.')
            return redirect('accounts:user_management')
    else:
        initial = {}
        if user_obj:
            initial = {
                'role': user_obj.profile.role if hasattr(user_obj, 'profile') else None,
                'status': user_obj.profile.status if hasattr(user_obj, 'profile') else 'active',
                'custom_rights': user_obj.profile.custom_rights if hasattr(user_obj, 'profile') else {},
            }
        form = UserManagementForm(instance=user_obj, initial=initial)

    context = {
        'form': form,
        'user_obj': user_obj,
        'is_edit': user_id is not None,
        'roles': UserRole.ROLE_CHOICES,
    }

    return render(request, 'accounts/user_form.html', context)


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def user_delete(request, user_id):
    """Delete user"""
    user = get_object_or_404(User, id=user_id)

    # Prevent self-deletion
    if user.id == request.user.id:
        messages.error(request, 'You cannot delete your own account.')
        return redirect('accounts:user_management')

    user_name = user.get_full_name()
    user.delete()

    messages.success(request, f'User {user_name} has been deleted successfully.')
    return redirect('accounts:user_management')


@login_required
@user_passes_test(is_admin)
@require_http_methods(["GET"])
def user_detail_api(request, user_id):
    """API endpoint to get user details and rights (for view modal)"""
    user = get_object_or_404(User, id=user_id)
    profile = user.profile if hasattr(user, 'profile') else None

    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.get_full_name(),
        'role': profile.role.get_name_display() if profile and profile.role else 'No Role',
        'role_key': profile.role.name if profile and profile.role else None,
        'status': profile.get_status_display() if profile else 'Unknown',
        'status_key': profile.status if profile else None,
        'last_login': profile.last_login_display.strftime('%Y-%m-%d %H:%M') if profile and profile.last_login_display else 'Never',
        'created_at': profile.created_at.strftime('%Y-%m-%d %H:%M') if profile else 'Unknown',
        'rights': profile.get_all_rights() if profile else [],
        'custom_rights': profile.custom_rights if profile else {},
    }

    return JsonResponse(data)


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def update_user_rights(request, user_id):
    """API endpoint to update user's access rights"""
    user = get_object_or_404(User, id=user_id)
    profile = user.profile if hasattr(user, 'profile') else None

    if not profile:
        return JsonResponse({'success': False, 'error': 'User profile not found'}, status=404)

    try:
        data = json.loads(request.body)
        custom_rights = data.get('rights', {})

        # Update custom rights
        profile.custom_rights = custom_rights
        profile.save()

        return JsonResponse({
            'success': True,
            'message': 'Access rights updated successfully',
            'rights': profile.get_all_rights()
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
@user_passes_test(is_admin)
@require_http_methods(["GET"])
def get_role_rights_api(request, role_name):
    """API endpoint to get default rights for a role"""
    rights = UserRole.get_default_rights(role_name)
    return JsonResponse({'rights': rights})


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def toggle_user_status(request, user_id):
    """Toggle user active/inactive status"""
    user = get_object_or_404(User, id=user_id)
    profile = user.profile if hasattr(user, 'profile') else None

    if not profile:
        messages.error(request, 'User profile not found.')
        return redirect('accounts:user_management')

    # Toggle status
    profile.status = 'inactive' if profile.status == 'active' else 'active'
    user.is_active = profile.status == 'active'
    user.save()
    profile.save()

    status_text = 'activated' if profile.status == 'active' else 'deactivated'
    messages.success(request, f'User {user.get_full_name()} has been {status_text}.')

    return redirect('accounts:user_management')