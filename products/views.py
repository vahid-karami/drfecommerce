from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

from django.db import transaction
from django.db.models import F
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Product, Sport
from .serializers import (
    CategorySerializer,
    SportSerializer,
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


class SportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sport.objects.filter(is_active=True)
    serializer_class = SportSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    pagination_class = None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["lang"] = self.request.query_params.get("lang", "en")
        return context


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

        sport = self.request.query_params.get("sport")
        if sport:
            queryset = queryset.filter(sports__slug=sport).distinct()

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

        on_sale = self.request.query_params.get("on_sale")
        if on_sale == "true":
            queryset = queryset.filter(discount_price__isnull=False, discount_price__lt=F("price"))

        is_featured = self.request.query_params.get("is_featured")
        if is_featured == "true":
            queryset = queryset.filter(is_featured=True)

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
            percentage = Decimal(str(percentage))
        except (InvalidOperation, ValueError, TypeError):
            return Response({"error": "Invalid percentage format"}, status=400)

        if not percentage.is_finite() or percentage <= -100:
            return Response({"error": "Percentage must be a number greater than -100"}, status=400)

        if category_id:
            try:
                category_id = int(category_id)
            except (ValueError, TypeError):
                return Response({"error": "Invalid category_id"}, status=400)

        queryset = self.get_queryset()
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        factor = 1 + percentage / 100

        def adjust(amount):
            new_amount = amount * factor
            # Round to nearest 1000 Toman for clean pricing, but never round a
            # small price down to zero.
            rounded = (new_amount / 1000).quantize(Decimal("1"), rounding=ROUND_HALF_UP) * 1000
            return rounded if rounded > 0 else new_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        updated_count = 0
        with transaction.atomic():
            for product in queryset.select_for_update():
                if product.price:
                    product.price = adjust(product.price)
                if product.discount_price:
                    product.discount_price = adjust(product.discount_price)
                product.save(update_fields=["price", "discount_price"])
                updated_count += 1

        return Response({"message": f"Successfully updated {updated_count} products", "updated_count": updated_count})
