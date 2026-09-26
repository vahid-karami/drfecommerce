"""Regression tests for bugs fixed after the initial import."""
import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import OTPCode

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestOTPSecurity:
    def test_otp_not_leaked_when_disabled(self, api_client, settings):
        settings.OTP_RETURN_IN_RESPONSE = False
        victim = User.objects.create_user(phone="09120000001", password="securepass123")
        res = api_client.post(reverse("accounts:otp-send"), {"phone": victim.phone, "otp_type": "login"})
        assert res.status_code == status.HTTP_200_OK
        assert "otp" not in res.data

    def test_otp_code_is_six_digits(self):
        for _ in range(200):
            code = OTPCode.generate_code()
            assert len(code) == 6 and code.isdigit()

    def test_otp_verify_is_throttled(self, api_client, monkeypatch):
        from rest_framework.throttling import SimpleRateThrottle

        monkeypatch.setattr(SimpleRateThrottle, "THROTTLE_RATES", {"otp": "3/min"})
        user = User.objects.create_user(phone="09120000002", password="securepass123")
        url = reverse("accounts:otp-verify")
        codes = [
            api_client.post(url, {"phone": user.phone, "code": "000000", "otp_type": "login"}).status_code
            for _ in range(4)
        ]
        assert codes[-1] == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
class TestOTPRegistrationFlow:
    def _send_and_verify(self, api_client, phone):
        api_client.post(reverse("accounts:otp-send"), {"phone": phone, "otp_type": "register"})
        otp = OTPCode.objects.filter(user__phone=phone, otp_type="register").latest("created_at")
        return api_client.post(
            reverse("accounts:otp-verify"), {"phone": phone, "code": otp.code, "otp_type": "register"}
        )

    def test_register_after_otp_verification(self, api_client):
        phone = "09121111111"
        assert self._send_and_verify(api_client, phone).status_code == status.HTTP_200_OK
        res = api_client.post(
            reverse("accounts:register"), {"phone": phone, "username": phone, "password": "securepass123"}
        )
        assert res.status_code == status.HTTP_201_CREATED, res.data

    def test_register_otp_can_be_resent(self, api_client):
        url = reverse("accounts:otp-send")
        assert api_client.post(url, {"phone": "09122222222", "otp_type": "register"}).status_code == 200
        assert api_client.post(url, {"phone": "09122222222", "otp_type": "register"}).status_code == 200

    def test_cannot_claim_unverified_phone_without_otp(self, api_client):
        phone = "09123333333"
        api_client.post(reverse("accounts:otp-send"), {"phone": phone, "otp_type": "register"})
        res = api_client.post(reverse("accounts:register"), {"phone": phone, "password": "attackerpass1"})
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.get(phone=phone).has_usable_password()

    def test_reset_otp_for_unknown_phone_does_not_create_user(self, api_client):
        res = api_client.post(reverse("accounts:otp-send"), {"phone": "09124444444", "otp_type": "reset_password"})
        assert res.status_code == status.HTTP_404_NOT_FOUND
        assert not User.objects.filter(phone="09124444444").exists()


@pytest.fixture
def order(db):
    from orders.models import Order

    owner = User.objects.create_user(phone="09125555555", password="securepass123")
    return Order.objects.create(
        user=owner, order_number="ORD-TEST0001", shipping_address="x", shipping_city="Tehran",
        shipping_zip="1234567890", shipping_phone="09125555555", subtotal=100, total=100,
    )


@pytest.mark.django_db
class TestPaymentVerification:
    def test_forged_mock_authority_does_not_mark_order_paid(self, api_client, order):
        from orders.models import Order

        res = api_client.post(
            reverse("orders:order-pay-verify"),
            {"order_number": order.order_number, "authority": "ZP-MOCK-forged", "gateway": "zarinpal"},
        )
        order.refresh_from_db()
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert order.payment_status != Order.PAYMENT_STATUS_PAID

    def test_idpay_verification_does_not_crash(self, order):
        from orders.models import Order

        client = APIClient()
        client.force_authenticate(order.user)
        init = client.post(
            reverse("orders:order-pay-initiate", kwargs={"order_number": order.order_number}), {"gateway": "idpay"}
        )
        assert init.status_code == status.HTTP_200_OK
        res = APIClient().post(
            reverse("orders:order-pay-verify"),
            {"order_number": order.order_number, "id": init.data["id"], "gateway": "idpay"},
        )
        assert res.status_code == status.HTTP_200_OK, res.data
        order.refresh_from_db()
        assert order.payment_status == Order.PAYMENT_STATUS_PAID

    def test_cannot_pay_cancelled_order(self, order):
        from orders.models import Order

        order.status = Order.STATUS_CANCELLED
        order.save()
        client = APIClient()
        client.force_authenticate(order.user)
        res = client.post(reverse("orders:order-pay-initiate", kwargs={"order_number": order.order_number}))
        assert res.status_code == status.HTTP_400_BAD_REQUEST
