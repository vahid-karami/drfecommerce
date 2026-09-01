from django.contrib import admin

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "price",
        "discount_price",
        "stock",
        "injury_type",
        "brand",
        "is_active",
        "is_featured",
    ]
    list_filter = ["category", "injury_type", "is_active", "is_featured"]
    search_fields = ["name", "brand", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
