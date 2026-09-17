import os
import shutil
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from products.models import Product, ProductImage

class Command(BaseCommand):
    help = 'Seeds product images from generated assets'

    def handle(self, *args, **kwargs):
        # Mapping from injury_type to generated image path
        brain_dir = "/Users/vahid/.gemini/antigravity/brain/bf49d75b-56fc-456d-9fb2-5a358b68c6db/"
        image_mapping = {
            'knee': os.path.join(brain_dir, 'knee_brace_1789655046028.jpg'),
            'ankle': os.path.join(brain_dir, 'ankle_brace_1789655056887.jpg'),
            'back': os.path.join(brain_dir, 'back_support_1789655082732.jpg'),
            'neck': os.path.join(brain_dir, 'back_support_1789655082732.jpg'), # Fallback
            'shoulder': os.path.join(brain_dir, 'shoulder_support_1789655092458.jpg'),
            'wrist': os.path.join(brain_dir, 'wrist_support_1789655118441.jpg'),
            'elbow': os.path.join(brain_dir, 'wrist_support_1789655118441.jpg'), # Fallback
            'hip': os.path.join(brain_dir, 'back_support_1789655082732.jpg'), # Fallback
            'general': os.path.join(brain_dir, 'compression_sleeve_1789655129478.jpg'),
        }

        # Clear existing images
        ProductImage.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Cleared existing product images."))

        # Ensure media directories exist
        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_products_dir, exist_ok=True)
        
        frontend_products_dir = os.path.join(settings.BASE_DIR, 'frontend', 'public', 'images', 'products')
        os.makedirs(frontend_products_dir, exist_ok=True)

        products = Product.objects.all()
        
        for product in products:
            source_img_path = image_mapping.get(product.injury_type, image_mapping['general'])
            
            if os.path.exists(source_img_path):
                # We will copy it directly using django files
                with open(source_img_path, 'rb') as f:
                    django_file = File(f, name=f"{product.slug}.jpg")
                    ProductImage.objects.create(
                        product=product,
                        image=django_file,
                        alt_text=product.name,
                        is_primary=True
                    )
                
                # Also copy to frontend public directory just in case the frontend prefers static pathing
                shutil.copy2(source_img_path, os.path.join(frontend_products_dir, f"{product.slug}.jpg"))
                
                self.stdout.write(f"Added image for product: {product.name}")
            else:
                self.stdout.write(self.style.WARNING(f"Image not found at {source_img_path}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded product images!"))
