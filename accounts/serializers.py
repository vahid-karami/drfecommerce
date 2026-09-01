from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserRegistrationSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value


class OTPSendSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp_type = serializers.ChoiceField(
        choices=["register", "login", "reset_password"],
        default="register"
    )


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)
    otp_type = serializers.ChoiceField(
        choices=["register", "login", "reset_password"],
        default="register"
    )


class PasswordResetSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "phone", "date_joined"]
