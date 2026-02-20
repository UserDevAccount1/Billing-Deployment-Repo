from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import UserProfile, UserRole, AccessRight


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password1", "password2")
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs['class'] = 'form-control'
        self.fields['password2'].widget.attrs['class'] = 'form-control'

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        if commit:
            user.save()
        return user


class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Username'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Password'
        })
    )


class UserManagementForm(forms.ModelForm):
    """Form for creating and editing users in the management dashboard"""

    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Leave blank to keep current password'
        }),
        help_text='Leave blank if you don\'t want to change the password'
    )

    confirm_password = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm password'
        })
    )

    role = forms.ModelChoiceField(
        queryset=UserRole.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        empty_label="Select Role"
    )

    status = forms.ChoiceField(
        choices=UserProfile.STATUS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'}),
        initial='active'
    )

    access_rights = forms.ModelMultipleChoiceField(
        queryset=AccessRight.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
        help_text='Select additional access rights beyond the role defaults'
    )

    custom_rights = forms.JSONField(
        required=False,
        widget=forms.HiddenInput(),
        initial=dict
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Username'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email address'
            }),
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'First name'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Last name'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Make password optional for existing users
        if self.instance and self.instance.pk:
            self.fields['password'].help_text = 'Leave blank to keep current password'
            self.fields['password'].required = False
            self.fields['confirm_password'].required = False
        else:
            # For new users, password is required
            self.fields['password'].required = True
            self.fields['confirm_password'].required = True
            self.fields['password'].help_text = 'Enter a strong password'

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        # Validate password confirmation
        if password or confirm_password:
            if password != confirm_password:
                raise forms.ValidationError("Passwords do not match")

            # Validate password strength
            if len(password) < 8:
                raise forms.ValidationError("Password must be at least 8 characters long")

        # For new users, password is required
        if not self.instance.pk and not password:
            raise forms.ValidationError("Password is required for new users")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)

        # Set password if provided
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)

        if commit:
            user.save()

        return user


class UserFilterForm(forms.Form):
    """Form for filtering users in the management dashboard"""

    role = forms.ChoiceField(
        choices=[('', 'All Roles')] + list(UserRole.ROLE_CHOICES),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    status = forms.ChoiceField(
        choices=[('', 'All Status')] + list(UserProfile.STATUS_CHOICES),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search name or email...'
        })
    )


class BulkUserActionForm(forms.Form):
    """Form for bulk actions on users"""

    ACTION_CHOICES = [
        ('activate', 'Activate'),
        ('deactivate', 'Deactivate'),
        ('delete', 'Delete'),
        ('change_role', 'Change Role'),
    ]

    action = forms.ChoiceField(
        choices=ACTION_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    user_ids = forms.CharField(
        widget=forms.HiddenInput()
    )

    new_role = forms.ModelChoiceField(
        queryset=UserRole.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        help_text='Required for "Change Role" action'
    )

    def clean(self):
        cleaned_data = super().clean()
        action = cleaned_data.get('action')
        new_role = cleaned_data.get('new_role')

        if action == 'change_role' and not new_role:
            raise forms.ValidationError("New role is required for changing roles")

        return cleaned_data