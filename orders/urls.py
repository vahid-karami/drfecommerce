from django.urls import path

from . import views

app_name = "orders"

urlpatterns = [
    path("", views.order_list, name="order-list"),
    path("create/", views.order_create, name="order-create"),
    path("<str:order_number>/", views.order_detail, name="order-detail"),
    path("<str:order_number>/cancel/", views.order_cancel, name="order-cancel"),
]
