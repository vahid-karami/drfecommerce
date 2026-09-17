from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductAdminSerializer,
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_serializer(self, *args, **kwargs):
        lang = self.request.query_params.get('lang', 'en')
        kwargs.setdefault('context', {})
        kwargs['context']['lang'] = lang
        return super().get_serializer(*args, **kwargs)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "brand"]
    ordering_fields = ["price", "created_at", "name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_serializer(self, *args, **kwargs):
        lang = self.request.query_params.get('lang', 'en')
        kwargs.setdefault('context', {})
        kwargs['context']['lang'] = lang
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)

        injury_type = self.request.query_params.get("injury_type")
        if injury_type:
            queryset = queryset.filter(injury_type=injury_type)

        brand = self.request.query_params.get("brand")
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        size = self.request.query_params.get("size")
        if size:
            queryset = queryset.filter(size__iexact=size)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        in_stock = self.request.query_params.get("in_stock")
        if in_stock == "true":
            queryset = queryset.filter(stock__gt=0)

        return queryset

    @action(detail=False, methods=["get"])
    def featured(self, request):
        featured = self.get_queryset().filter(is_featured=True)
        lang = self.request.query_params.get('lang', 'en')
        page = self.paginate_queryset(featured)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={'lang': lang})
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(featured, many=True, context={'lang': lang})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def injury_types(self, request):
        return Response(dict(Product.INJURY_TYPE_CHOICES))


class ProductAdminViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("category").prefetch_related("images")
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "brand", "injury_type"]
    ordering_fields = ["price", "created_at", "name", "stock"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductCreateSerializer
        return ProductAdminSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        is_featured = self.request.query_params.get("is_featured")
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == "true")

        in_stock = self.request.query_params.get("in_stock")
        if in_stock is not None:
            if in_stock.lower() == "true":
                queryset = queryset.filter(stock__gt=0)
            else:
                queryset = queryset.filter(stock__lte=0)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)

        return queryset

    @action(detail=False, methods=["post"])
    def bulk_price_update(self, request):
        category_id = request.data.get("category_id")
        percentage = request.data.get("percentage")
        
        if percentage is None:
            return Response({"error": "Percentage is required"}, status=400)
            
        try:
            percentage = float(percentage)
        except ValueError:
            return Response({"error": "Invalid percentage format"}, status=400)

        queryset = self.get_queryset()
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        updated_count = 0
        for product in queryset:
            # Calculate new price based on current price
            if product.price:
                new_price = float(product.price) * (1 + (percentage / 100))
                # Round to nearest 1000 Toman for clean pricing
                new_price = round(new_price / 1000) * 1000
                product.price = new_price
                
            # Optionally calculate new discount price if it exists
            if product.discount_price:
                new_discount = float(product.discount_price) * (1 + (percentage / 100))
                new_discount = round(new_discount / 1000) * 1000
                product.discount_price = new_discount
                
            product.save(update_fields=["price", "discount_price"])
            updated_count += 1
            
        return Response({"message": f"Successfully updated {updated_count} products", "updated_count": updated_count})
