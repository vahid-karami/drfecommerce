from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPCode
from .serializers import (
    OTPSendSerializer,
    OTPVerifySerializer,
    PasswordResetSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    serializer = OTPSendSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data["phone"]
    otp_type = serializer.validated_data["otp_type"]

    if otp_type == OTPCode.OTP_TYPE_REGISTER and User.objects.filter(phone=phone).exists():
        return Response(
            {"error": "A user with this phone number already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp_type == OTPCode.OTP_TYPE_LOGIN:
        try:
            User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {"error": "No user found with this phone number."},
                status=status.HTTP_404_NOT_FOUND,
            )

    user, _ = User.objects.get_or_create(phone=phone, defaults={"is_verified": False})

    OTPCode.objects.filter(user=user, otp_type=otp_type, is_used=False).update(is_used=True)

    otp = OTPCode.objects.create(user=user, otp_type=otp_type)

    return Response(
        {
            "message": "OTP sent successfully.",
            "phone": phone,
            "otp": otp.code,
            "expires_in": "5 minutes",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data["phone"]
    code = serializer.validated_data["code"]
    otp_type = serializer.validated_data["otp_type"]

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response(
            {"error": "No user found with this phone number."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        otp = OTPCode.objects.filter(
            user=user,
            code=code,
            otp_type=otp_type,
            is_used=False,
        ).latest("created_at")
    except OTPCode.DoesNotExist:
        return Response(
            {"error": "Invalid OTP code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp.is_expired():
        return Response(
            {"error": "OTP has expired. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp.mark_used()

    if otp_type == OTPCode.OTP_TYPE_REGISTER:
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        return Response(
            {
                "message": "Phone number verified successfully.",
                "next_step": "Please complete registration with phone and password.",
            },
            status=status.HTTP_200_OK,
        )

    if otp_type == OTPCode.OTP_TYPE_LOGIN:
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "tokens": tokens,
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {"message": "OTP verified successfully."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data["phone"]

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        user = None

    if user and not user.is_verified:
        return Response(
            {"error": "Please verify your phone number first with OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if user and user.has_usable_password():
        return Response(
            {"error": "User already registered. Please login."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if user:
        user.set_password(serializer.validated_data["password"])
        user.first_name = serializer.validated_data.get("first_name", "")
        user.last_name = serializer.validated_data.get("last_name", "")
        user.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "message": "Registration successful.",
                "tokens": tokens,
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    user = User.objects.create_user(
        phone=phone,
        password=serializer.validated_data["password"],
        first_name=serializer.validated_data.get("first_name", ""),
        last_name=serializer.validated_data.get("last_name", ""),
        is_verified=True,
    )
    tokens = get_tokens_for_user(user)
    return Response(
        {
            "message": "Registration successful.",
            "tokens": tokens,
            "user": UserProfileSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    serializer = PasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data["phone"]
    code = serializer.validated_data["code"]

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response(
            {"error": "No user found with this phone number."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        otp = OTPCode.objects.filter(
            user=user,
            code=code,
            otp_type=OTPCode.OTP_TYPE_RESET_PASSWORD,
            is_used=False,
        ).latest("created_at")
    except OTPCode.DoesNotExist:
        return Response(
            {"error": "Invalid OTP code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp.is_expired():
        return Response(
            {"error": "OTP has expired. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp.mark_used()
    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return Response(
        {"message": "Password reset successful. You can now login."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == "GET":
        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)

    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)
