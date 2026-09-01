from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def cart_detail(request):
    cart = get_or_create_cart(request.user)
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cart_add_item(request):
    cart = get_or_create_cart(request.user)

    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))

    if not product_id:
        return Response(
            {"error": "product_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if product.stock < quantity:
        return Response(
            {"error": f"Only {product.stock} items available in stock."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": quantity},
    )

    if not created:
        new_quantity = cart_item.quantity + quantity
        if product.stock < new_quantity:
            return Response(
                {"error": f"Only {product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_item.quantity = new_quantity
        cart_item.save()

    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def cart_update_item(request):
    cart = get_or_create_cart(request.user)

    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    if not item_id or quantity is None:
        return Response(
            {"error": "item_id and quantity are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response(
            {"error": "Cart item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    quantity = int(quantity)

    if quantity <= 0:
        cart_item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    if cart_item.product.stock < quantity:
        return Response(
            {"error": f"Only {cart_item.product.stock} items available in stock."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item.quantity = quantity
    cart_item.save()

    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def cart_remove_item(request):
    cart = get_or_create_cart(request.user)

    item_id = request.data.get("item_id")
    if not item_id:
        return Response(
            {"error": "item_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response(
            {"error": "Cart item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item.delete()
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def cart_clear(request):
    cart = get_or_create_cart(request.user)
    cart.items.all().delete()
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
