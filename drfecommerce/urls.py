from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView


def api_root(request):
    return JsonResponse({
        "message": "SportMed Shop API",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/auth/",
            "products": "/api/products/",
            "cart": "/api/cart/",
            "orders": "/api/orders/",
            "reviews": "/api/reviews/",
            "favorites": "/api/favorites/",
        },
        "frontend": "http://localhost:5173",
    })


urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/favorites/", include("favorites.urls")),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
