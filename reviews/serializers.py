from rest_framework import serializers

from accounts.serializers import UserProfileSerializer

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "rating",
            "title",
            "comment",
            "is_verified_purchase",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_verified_purchase", "created_at", "updated_at"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["rating", "title", "comment"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
