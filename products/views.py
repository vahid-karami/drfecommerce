from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


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
        page = self.paginate_queryset(featured)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def injury_types(self, request):
        return Response(dict(Product.INJURY_TYPE_CHOICES))
