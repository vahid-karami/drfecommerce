from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    name_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "name_fa",
            "slug",
            "description",
            "description_fa",
            "image",
            "product_count",
            "name_localized",
            "description_localized",
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def get_name_localized(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.get_name(lang)

    def get_description_localized(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.get_description(lang)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary"]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    primary_image = serializers.SerializerMethodField()
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    name_localized = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "name_fa",
            "slug",
            "category_name",
            "price",
            "discount_price",
            "effective_price",
            "injury_type",
            "brand",
            "size",
            "primary_image",
            "in_stock",
            "is_featured",
            "name_localized",
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        first_image = obj.images.first()
        if first_image:
            return ProductImageSerializer(first_image, context=self.context).data
        return None

    def get_name_localized(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.get_name(lang)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    name_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "name_fa",
            "slug",
            "description",
            "description_fa",
            "category",
            "price",
            "discount_price",
            "effective_price",
            "stock",
            "injury_type",
            "brand",
            "size",
            "color",
            "weight",
            "material",
            "images",
            "in_stock",
            "is_featured",
            "created_at",
            "updated_at",
            "name_localized",
            "description_localized",
        ]

    def get_name_localized(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.get_name(lang)

    def get_description_localized(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.get_description(lang)


class ProductAdminSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    margin = serializers.SerializerMethodField()
    margin_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "category_name",
            "price",
            "price_irr",
            "cost",
            "cost_irr",
            "discount_price",
            "discount_price_irr",
            "stock",
            "injury_type",
            "brand",
            "size",
            "color",
            "weight",
            "material",
            "is_active",
            "is_featured",
            "in_stock",
            "margin",
            "margin_percent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "in_stock"]

    def get_margin(self, obj):
        cost = obj.cost or 0
        price = obj.effective_price
        if cost and price:
            return float(price) - float(cost)
        return None

    def get_margin_percent(self, obj):
        cost = obj.cost or 0
        price = obj.effective_price
        if cost and price and cost > 0:
            return round(((float(price) - float(cost)) / float(cost)) * 100, 1)
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "name",
            "name_fa",
            "description",
            "description_fa",
            "category",
            "price",
            "price_irr",
            "cost",
            "cost_irr",
            "discount_price",
            "discount_price_irr",
            "stock",
            "injury_type",
            "brand",
            "size",
            "color",
            "weight",
            "material",
            "is_active",
            "is_featured",
        ]
