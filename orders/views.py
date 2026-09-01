import uuid
from decimal import Decimal

from django.db import transaction
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from cart.models import Cart

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderSerializer


def generate_order_number():
    return f"ORD-{uuid.uuid4().hex[:8].upper()}"


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def order_list(request):
    orders = Order.objects.filter(user=request.user)
    return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def order_detail(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def order_create(request):
    serializer = OrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        cart = Cart.objects.prefetch_related("items__product").get(user=request.user)
    except Cart.DoesNotExist:
        return Response(
            {"error": "Your cart is empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_items = cart.items.all()
    if not cart_items:
        return Response(
            {"error": "Your cart is empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for item in cart_items:
        if item.quantity > item.product.stock:
            return Response(
                {
                    "error": f"Insufficient stock for {item.product.name}. "
                    f"Available: {item.product.stock}, Requested: {item.quantity}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    subtotal = sum(item.subtotal for item in cart_items)
    shipping_cost = Decimal('0') if subtotal >= 100 else Decimal('9.99')
    total = subtotal + shipping_cost

    order = Order.objects.create(
        user=request.user,
        order_number=generate_order_number(),
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
        **serializer.validated_data,
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            product_price=item.product.effective_price,
            quantity=item.quantity,
        )
        item.product.stock -= item.quantity
        item.product.save(update_fields=["stock"])

    cart.items.all().delete()

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def order_cancel(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if order.status not in [Order.STATUS_PENDING, Order.STATUS_CONFIRMED]:
        return Response(
            {"error": "This order cannot be cancelled."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = Order.STATUS_CANCELLED
    order.save(update_fields=["status"])

    for item in order.items.all():
        if item.product:
            item.product.stock += item.quantity
            item.product.save(update_fields=["stock"])

    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
