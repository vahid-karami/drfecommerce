from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    INJURY_TYPE_KNEE = "knee"
    INJURY_TYPE_ANKLE = "ankle"
    INJURY_TYPE_BACK = "back"
    INJURY_TYPE_NECK = "neck"
    INJURY_TYPE_SHOULDER = "shoulder"
    INJURY_TYPE_WRIST = "wrist"
    INJURY_TYPE_ELBOW = "elbow"
    INJURY_TYPE_HIP = "hip"
    INJURY_TYPE_GENERAL = "general"

    INJURY_TYPE_CHOICES = [
        (INJURY_TYPE_KNEE, "Knee Support"),
        (INJURY_TYPE_ANKLE, "Ankle Support"),
        (INJURY_TYPE_BACK, "Back Support"),
        (INJURY_TYPE_NECK, "Neck Support"),
        (INJURY_TYPE_SHOULDER, "Shoulder Support"),
        (INJURY_TYPE_WRIST, "Wrist Support"),
        (INJURY_TYPE_ELBOW, "Elbow Support"),
        (INJURY_TYPE_HIP, "Hip Support"),
        (INJURY_TYPE_GENERAL, "General Support"),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    injury_type = models.CharField(max_length=20, choices=INJURY_TYPE_CHOICES, default=INJURY_TYPE_GENERAL)
    brand = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=20, blank=True, help_text="e.g., S, M, L, XL or One Size")
    color = models.CharField(max_length=50, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, help_text="Weight in grams")
    material = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_images"
        ordering = ["-is_primary", "-created_at"]

    def __str__(self):
        return f"Image for {self.product.name}"
