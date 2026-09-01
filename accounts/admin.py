from django.contrib import admin

from .models import OTPCode, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["phone", "first_name", "last_name", "is_verified", "is_staff", "date_joined"]
    list_filter = ["is_verified", "is_staff", "is_active"]
    search_fields = ["phone", "first_name", "last_name"]
    readonly_fields = ["date_joined"]


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ["user", "code", "otp_type", "is_used", "created_at", "expires_at"]
    list_filter = ["otp_type", "is_used"]
    search_fields = ["user__phone", "code"]
    readonly_fields = ["created_at"]
