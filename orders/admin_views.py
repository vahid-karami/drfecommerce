"""Staff-only endpoints used by the React admin portal."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from products.models import Product

from .models import Order
from .serializers import AdminOrderSerializer

LOW_STOCK_THRESHOLD = 5


@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    now = timezone.now()
    today = timezone.localdate()
    paid = Order.objects.filter(payment_status=Order.PAYMENT_STATUS_PAID)

    by_status = dict(Order.objects.values_list("status").annotate(n=Count("id")).values_list("status", "n"))

    week_start = today - timedelta(days=6)
    daily = {
        row["day"]: row
        for row in paid.filter(created_at__date__gte=week_start)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(revenue=Sum("total"), orders=Count("id"))
    }
    last_7_days = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        row = daily.get(day, {})
        last_7_days.append({"date": day.isoformat(), "revenue": row.get("revenue") or 0, "orders": row.get("orders") or 0})

    low_stock = Product.objects.filter(is_active=True, stock__lte=LOW_STOCK_THRESHOLD).order_by("stock")[:8]
    recent = Order.objects.select_related("user").prefetch_related("items__product__images")[:6]

    return Response({
        "revenue_total": paid.aggregate(v=Sum("total"))["v"] or 0,
        "revenue_30d": paid.filter(created_at__gte=now - timedelta(days=30)).aggregate(v=Sum("total"))["v"] or 0,
        "orders_total": Order.objects.count(),
        "orders_today": Order.objects.filter(created_at__date=today).count(),
        "awaiting_payment": Order.objects.filter(
            status=Order.STATUS_PENDING, payment_status__in=[Order.PAYMENT_STATUS_PENDING, Order.PAYMENT_STATUS_FAILED]
        ).count(),
        "to_ship": Order.objects.filter(
            status__in=[Order.STATUS_CONFIRMED, Order.STATUS_PROCESSING], payment_status=Order.PAYMENT_STATUS_PAID
        ).count(),
        "orders_by_status": by_status,
        "customers": get_user_model().objects.filter(is_staff=False, orders__isnull=False).distinct().count(),
        "products_active": Product.objects.filter(is_active=True).count(),
        "last_7_days": last_7_days,
        "low_stock": [
            {"id": p.id, "slug": p.slug, "name": p.name_fa or p.name, "stock": p.stock} for p in low_stock
        ],
        "recent_orders": AdminOrderSerializer(recent, many=True).data,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def admin_order_list(request):
    orders = Order.objects.select_related("user").prefetch_related("items__product__images")

    status_filter = request.query_params.get("status")
    if status_filter:
        orders = orders.filter(status=status_filter)

    payment = request.query_params.get("payment_status")
    if payment:
        orders = orders.filter(payment_status=payment)

    search = request.query_params.get("search", "").strip()
    if search:
        orders = orders.filter(
            Q(order_number__icontains=search)
            | Q(user__phone__icontains=search)
            | Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
            | Q(shipping_phone__icontains=search)
        )

    return Response(AdminOrderSerializer(orders[:200], many=True).data)


@api_view(["PATCH"])
@permission_classes([permissions.IsAdminUser])
@transaction.atomic
def admin_order_update(request, order_number):
    try:
        order = Order.objects.select_for_update().get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    valid = dict(Order.STATUS_CHOICES)
    if new_status not in valid:
        return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

    if order.status == Order.STATUS_CANCELLED and new_status != Order.STATUS_CANCELLED:
        return Response({"error": "A cancelled order cannot be reopened."}, status=status.HTTP_400_BAD_REQUEST)

    if new_status == Order.STATUS_CANCELLED and order.status != Order.STATUS_CANCELLED:
        # Put the items back on the shelf, as a customer cancellation does.
        for item in order.items.all():
            if item.product_id:
                Product.objects.filter(pk=item.product_id).update(stock=F("stock") + item.quantity)

    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    return Response(AdminOrderSerializer(order).data)
