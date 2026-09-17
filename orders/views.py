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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def order_pay_initiate(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number, user=request.user)
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if order.payment_status == Order.PAYMENT_STATUS_PAID:
        return Response({"error": "This order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

    gateway_name = request.data.get("gateway", "zarinpal")
    callback_url = request.data.get(
        "callback_url",
        request.build_absolute_uri(f"/api/orders/payment/verify/?order_number={order.order_number}&gateway={gateway_name}"),
    )

    from .payments import get_payment_gateway

    gateway = get_payment_gateway(gateway_name)
    payment_data = gateway.request_payment(order, callback_url)

    return Response(
        {
            "order_number": order.order_number,
            "gateway": gateway_name,
            **payment_data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST", "GET"])
@permission_classes([permissions.AllowAny])
def order_pay_verify(request):
    data = request.data if request.method == "POST" else request.query_params
    order_number = data.get("order_number")
    authority = data.get("Authority") or data.get("authority") or data.get("id")
    gateway_name = data.get("gateway", "zarinpal")

    if not order_number or not authority:
        return Response(
            {"error": "Missing order_number or payment authority."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if order.payment_status == Order.PAYMENT_STATUS_PAID:
        return Response(
            {"message": "Order already paid.", "order": OrderSerializer(order).data},
            status=status.HTTP_200_OK,
        )

    from .payments import get_payment_gateway

    gateway = get_payment_gateway(gateway_name)
    amount = order.total
    verification = gateway.verify_payment(authority, amount=amount)

    if verification.get("success"):
        order.payment_status = Order.PAYMENT_STATUS_PAID
        order.status = Order.STATUS_CONFIRMED
        order.save(update_fields=["payment_status", "status"])
        return Response(
            {
                "success": True,
                "message": "Payment successful and verified.",
                "ref_id": verification.get("ref_id") or verification.get("track_id"),
                "order": OrderSerializer(order).data,
            },
            status=status.HTTP_200_OK,
        )

    order.payment_status = Order.PAYMENT_STATUS_FAILED
    order.save(update_fields=["payment_status"])
    return Response(
        {
            "success": False,
            "error": verification.get("error", "Payment verification failed."),
        },
        status=status.HTTP_400_BAD_REQUEST,
    )
