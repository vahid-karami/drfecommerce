import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeletons';
import HeroCarousel from '../components/HeroCarousel';
import CardRail from '../components/CardRail';
import Icon from '../components/Icon';
import { BODY_PARTS } from '../utils/bodyParts';
import { usePageMeta } from '../utils/seo';
import { useCategories, useSports, sportName } from '../utils/catalog';

const imageOf = (product) => product?.primary_image?.image;

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fa' ? 'fa' : 'en';
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = useCategories();
  const sports = useSports();

  usePageMeta({
    title: t('home.metaTitle', 'ساپورت‌ها و بریس‌های ورزشی و طبی'),
    description: t('home.metaDescription', 'زانوبند، قوزک‌بند، کمربند طبی و پوشاک فشاری برای پیشگیری، درمان و عملکرد بهتر.'),
  });

  useEffect(() => {
    Promise.all([apiClient.get(ENDPOINTS.products), apiClient.get(ENDPOINTS.featuredProducts)])
      .then(([allRes, featuredRes]) => {
        setProducts(allRes.data.results || allRes.data);
        setFeatured(featuredRes.data.results || featuredRes.data);
      })
      .catch((error) => console.error('Failed to load home page data:', error))
      .finally(() => setLoading(false));
  }, []);

  // First product image per body part / category, used as the tile photo.
  const byInjury = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!map[p.injury_type] && imageOf(p)) map[p.injury_type] = p;
    });
    return map;
  }, [products]);

  const byCategoryName = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!map[p.category_name] && imageOf(p)) map[p.category_name] = p;
    });
    return map;
  }, [products]);

  const bodyPartTiles = BODY_PARTS.filter((p) => byInjury[p.key]).map((p) => ({
    key: p.key,
    to: `/products?injury_type=${p.key}`,
    title: lang === 'fa' ? p.fa : p.en,
    subtitle: lang === 'fa' ? p.blurbFa : p.blurbEn,
    image: imageOf(byInjury[p.key]),
  }));

  const categoryTiles = categories.map((c) => ({
    key: c.slug,
    to: `/products?category=${c.slug}`,
    title: (lang === 'fa' && c.name_fa) || c.name,
    subtitle: t('products.productsCount', { count: c.product_count }),
    image: c.image || imageOf(byCategoryName[c.name]),
  }));

  const sportTiles = sports
    .filter((s) => s.product_count > 0)
    .map((s) => ({
      key: s.slug,
      to: `/products?sport=${s.slug}`,
      title: sportName(s, lang),
      subtitle: t('products.productsCount', { count: s.product_count }),
      image: s.cover_image,
    }));

  const onSale = products.find((p) => p.discount_price && Number(p.effective_price) < Number(p.price));

  const slides = [
    {
      key: 'knee',
      eyebrow: t('home.slide1Eyebrow', 'حمایت هدفمند از زانو'),
      title: t('home.slide1Title', 'با خیال راحت به میدان برگرد'),
      text: t('home.slide1Text', 'زانوبندها و اسلیوهای فشاری ما با پشتیبانی دقیق از مفصل، درد را کم می‌کنند و ثبات را به حرکت برمی‌گردانند.'),
      cta: t('home.slide1Cta', 'خرید زانوبند'),
      to: '/products?injury_type=knee',
      image: imageOf(byInjury.knee),
    },
    {
      key: 'back',
      eyebrow: t('home.slide2Eyebrow', 'سلامت ستون فقرات'),
      title: t('home.slide2Title', 'کمردرد را جدی بگیرید'),
      text: t('home.slide2Text', 'ساپورت‌های کمری با فشار یکنواخت، عضلات را آرام می‌کنند و در کار روزانه و ورزش همراه شما هستند.'),
      cta: t('home.slide2Cta', 'مشاهده ساپورت‌های کمر'),
      to: '/products?injury_type=back',
      image: imageOf(byInjury.back),
    },
    onSale && {
      key: 'sale',
      eyebrow: t('home.slide3Eyebrow', 'پیشنهاد ویژه'),
      title: t('home.slide3Title', 'تخفیف‌های این هفته'),
      text: t('home.slide3Text', 'منتخبی از پرفروش‌ترین ساپورت‌ها با قیمت ویژه، فقط برای مدت محدود.'),
      cta: t('home.seeOffers', 'مشاهده پیشنهادها'),
      to: '/products?on_sale=true',
      image: imageOf(onSale),
    },
  ].filter((s) => s && s.image);

  const guides = [
    {
      key: 'knee',
      title: t('home.guideKneeTitle', 'راهنمای زانودرد'),
      text: t('home.guideKneeText', 'علت‌ها، علائم و ساپورت مناسب برای هر مرحله.'),
      to: '/products?injury_type=knee',
      image: imageOf(byInjury.knee),
    },
    {
      key: 'back',
      title: t('home.guideBackTitle', 'رهایی از کمردرد'),
      text: t('home.guideBackText', 'پشتیبانی از ستون فقرات در کار، رانندگی و ورزش.'),
      to: '/products?injury_type=back',
      image: imageOf(byInjury.back),
    },
    {
      key: 'ankle',
      title: t('home.guideAnkleTitle', 'پیچ‌خوردگی مچ پا'),
      text: t('home.guideAnkleText', 'از ثابت‌سازی اولیه تا بازگشت کامل به تمرین.'),
      to: '/products?injury_type=ankle',
      image: imageOf(byInjury.ankle),
    },
  ].filter((g) => g.image);

  const topSellers = (featured.length ? featured : products).slice(0, 4);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="container">
          {loading ? <div className="hero-skeleton" /> : <HeroCarousel slides={slides} />}
        </div>
      </section>

      {bodyPartTiles.length > 0 && (
        <section className="band band-sky">
          <div className="container">
            <CardRail
              eyebrow={t('home.findYourProduct', 'محصول مناسب خود را پیدا کنید')}
              title={t('home.shopByBodyPart')}
              cta={{ to: '/products', label: t('home.viewAllBodyParts', 'مشاهده همه') }}
              items={bodyPartTiles}
              variant="solid"
            />
          </div>
        </section>
      )}

      {sportTiles.length > 0 && (
        <section className="band">
          <div className="container">
            <CardRail
              eyebrow={t('home.findYourProduct', 'محصول مناسب خود را پیدا کنید')}
              title={t('home.shopBySport', 'خرید بر اساس ورزش')}
              items={sportTiles}
              variant="soft"
            />
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="band band-sky">
          <div className="container rail-layout">
            <div className="rail-intro">
              <span className="eyebrow">{t('home.discover', 'بیشتر بدانید')}</span>
              <h2 className="section-title">{t('home.howWeHelp', 'اسپورت‌مد چگونه کمک می‌کند')}</h2>
              <p className="rail-desc">
                {t('home.howWeHelpText', 'از درد مزمن مفاصل تا آسیب‌های ورزشی؛ راه‌هایی را ببینید که به شما کمک می‌کنند فعال بمانید.')}
              </p>
            </div>
            <div className="guide-grid">
              {guides.map((g) => (
                <Link key={g.key} to={g.to} className="guide-card">
                  <div className="guide-card-img"><img src={g.image} alt="" loading="lazy" /></div>
                  <div className="guide-card-body">
                    <h3>{g.title}</h3>
                    <p>{g.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="band">
        <div className="container">
          <div className="section-head-center">
            <h2 className="section-title">{t('home.topSellers', 'پرفروش‌ترین‌ها')}</h2>
            <Link to="/products" className="link-arrow">
              {t('home.viewAllProducts', 'همه محصولات')} <Icon name="arrowLeft" size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : topSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {categoryTiles.length > 0 && (
        <section className="band band-sky">
          <div className="container">
            <CardRail
              eyebrow={t('home.findYourProduct', 'محصول مناسب خود را پیدا کنید')}
              title={t('home.shopByType', 'خرید بر اساس نوع محصول')}
              cta={{ to: '/categories', label: t('home.viewAllCategories', 'همه دسته‌ها') }}
              items={categoryTiles}
              variant="soft"
            />
          </div>
        </section>
      )}

      <section className="band band-tight">
        <div className="container">
          <div className="advice-banner">
            <div>
              <span className="eyebrow">{t('home.adviceEyebrow', 'مشاوره رایگان')}</span>
              <h2>{t('home.adviceTitle', 'در انتخاب سایز یا مدل مردد هستید؟')}</h2>
              <p>{t('home.adviceText', 'کارشناسان ما کمک می‌کنند ساپورتی را انتخاب کنید که دقیقاً به نیاز شما پاسخ می‌دهد.')}</p>
            </div>
            <a href="tel:+982112345678" className="btn btn-secondary btn-lg">
              <Icon name="phone" size={18} /> {t('home.adviceCta', 'تماس با کارشناس')}
            </a>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="container trust-grid">
          {[
            { icon: 'truck', title: t('home.trustShipTitle', 'ارسال سریع'), text: t('home.trustShipText', 'ارسال رایگان به سراسر کشور') },
            { icon: 'card', title: t('home.trustPayTitle', 'پرداخت امن'), text: t('home.trustPayText', 'درگاه زرین‌پال و آیدی‌پی') },
            { icon: 'returns', title: t('home.trustReturnTitle', 'بازگشت آسان'), text: t('home.trustReturnText', '۷ روز ضمانت بازگشت کالا') },
            { icon: 'headset', title: t('home.trustSupportTitle', 'پشتیبانی تخصصی'), text: t('home.trustSupportText', 'مشاوره پیش و پس از خرید') },
          ].map((item) => (
            <div key={item.icon} className="trust-item">
              <Icon name={item.icon} size={28} strokeWidth={1.6} />
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band seo-block">
        <div className="container narrow">
          <h2 className="section-title">{t('home.aboutTitle', 'اسپورت‌مد')}</h2>
          <p>
            {t('home.aboutText', 'ساپورت‌ها و پوشاک فشاری اسپورت‌مد با پارچه‌های تنفس‌پذیر و فشار هدفمند، گردش خون را بهبود می‌دهند و به ثبات مفصل کمک می‌کنند؛ نتیجه، درد کمتر، ریکاوری سریع‌تر و اعتماد به نفس بیشتر در حرکت است. برای شروع، عضو بدن یا نوع محصول مورد نظرتان را انتخاب کنید.')}
          </p>
        </div>
      </section>
    </div>
  );
}
