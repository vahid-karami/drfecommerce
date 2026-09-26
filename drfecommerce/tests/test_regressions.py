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
