from decimal import Decimal

from django.core.management.base import BaseCommand

from products.models import Category, Product


class Command(BaseCommand):
    help = 'Seed database with Persian (Farsi) translations for categories and products'

    def handle(self, *args, **options):
        self.stdout.write('Creating Persian translations...')

        persian_categories = {
            'knee-braces': {
                'name_fa': 'بریس زانو',
                'description_fa': 'حمایت و تثبیت برای آسیب‌های زانویی'
            },
            'ankle-supports': {
                'name_fa': 'حمایت مچ پا',
                'description_fa': 'محافظت و بهبود برای آسیب‌های مچ پا'
            },
            'back-supports': {
                'name_fa': 'حمایت کمر',
                'description_fa': 'محصولات حمایت کمری و ستون فقرات'
            },
            'shoulder-supports': {
                'name_fa': 'حمایت شانه',
                'description_fa': 'چرخنده شانه و تثبیت‌کننده‌ها'
            },
            'wrist-elbow': {
                'name_fa': 'مچ دست و آرنج',
                'description_fa': 'حمایت برای شرایط مچ دست و آرنج'
            },
            'compression-wear': {
                'name_fa': 'لباس فشاری',
                'description_fa': 'اسلیوهای فشاری و حمایت‌ها'
            },
        }

        for slug, data in persian_categories.items():
            try:
                category = Category.objects.get(slug=slug)
                category.name_fa = data['name_fa']
                category.description_fa = data['description_fa']
                category.save()
                self.stdout.write(f'  Updated category: {category.name} -> {data["name_fa"]}')
            except Category.DoesNotExist:
                self.stdout.write(f'  Category {slug} not found, skipping')

        persian_products = {
            'premium-knee-stabilizer': {
                'name_fa': 'بریس زانو حرفه‌ای',
                'description_fa': 'بریس زانو طراحی شده برای حداکثر تثبیت در طول بهبودی. دارای بندهای قابل تنظیم و مواد قابل تنفس برای راحتی تمام روز.'
            },
            'performance-knee-sleeve': {
                'name_fa': 'اسلیو زانو ورزشی',
                'description_fa': 'اسلیو فشاری سبک وزن برای حمایت خفیف و بهبود گردش خون در طول فعالیت.'
            },
            'ankle-stabilizer-brace': {
                'name_fa': 'بریس تثبیت‌کننده مچ پا',
                'description_fa': 'ارائه حمایت محکم برای許可 مچ پا و جلوگیری از آسیب مجدد در طول فعالیت‌های ورزشی.'
            },
            'compression-ankle-sleeve': {
                'name_fa': 'اسلیو فشاری مچ پا',
                'description_fa': 'اسلیو فشاری بدون درز برای حمایت خفیف و بهبود بهبودی.'
            },
            'lumbar-sports-support': {
                'name_fa': 'حمایت کمری ورزشی',
                'description_fa': 'حمایت کمری ارگونومیک طراحی شده برای ورزشکاران. ارائه تثبیت کمری در طول بلند کردن وزن و ورزش.'
            },
            'shoulder-support-brace': {
                'name_fa': 'بریس حمایت شانه',
                'description_fa': 'بریس قابل تنظیم برای حمایت چرخنده شانه و پیشگیری از آسیب.'
            },
            'tennis-elbow-support': {
                'name_fa': 'حمایت آرنج تنیس',
                'description_fa': 'فشاری هدفمند برای آرنج تنیس و آرنج گلفر برای کاهش درد.'
            },
            'wrist-stabilizer': {
                'name_fa': 'تثبیت‌کننده مچ دست',
                'description_fa': 'حمایت صلب برای许可 مچ دست و کاهش درد تونل کارپال.'
            },
            'compression-calf-sleeve': {
                'name_fa': 'اسلیو فشاری ساق پا',
                'description_fa': 'فشاری تدریجی برای بهبود گردش خون و کاهش خستگی عضلات.'
            },
            'recovery-foam-roller': {
                'name_fa': 'رولر فوم بهبودی',
                'description_fa': 'رولر فوم با چگالی بالا برای رهایی میوفاسچیال و بهبود عضلات.'
            },
        }

        for slug, data in persian_products.items():
            try:
                product = Product.objects.get(slug=slug)
                product.name_fa = data['name_fa']
                product.description_fa = data['description_fa']
                product.price_irr = int(product.price * 60000)  # Approximate USD to IRR conversion
                product.save()
                self.stdout.write(f'  Updated product: {product.name} -> {data["name_fa"]}')
            except Product.DoesNotExist:
                self.stdout.write(f'  Product {slug} not found, skipping')

        self.stdout.write(self.style.SUCCESS('Persian translations added successfully!'))
