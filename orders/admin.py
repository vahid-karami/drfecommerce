from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["subtotal"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "user",
        "status",
        "payment_status",
        "total",
        "item_count",
        "created_at",
    ]
    list_filter = ["status", "payment_status", "created_at"]
    search_fields = ["order_number", "user__phone", "shipping_phone"]
    inlines = [OrderItemInline]
    readonly_fields = ["order_number", "created_at", "updated_at"]
    list_editable = ["status", "payment_status"]
    list_per_page = 50
    fieldsets = (
        (None, {
            "fields": ("order_number", "user", "status", "payment_status")
        }),
        ("Shipping Information", {
            "fields": (
                "shipping_address",
                "shipping_city",
                "shipping_state",
                "shipping_zip",
                "shipping_country",
                "shipping_phone",
            )
        }),
        ("Financial", {
            "fields": ("subtotal", "shipping_cost", "discount", "total")
        }),
        ("Notes", {
            "fields": ("notes",),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"
