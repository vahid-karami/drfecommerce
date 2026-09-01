# SportMed Shop - Development TODO

## Phase 1: Internationalization (i18n) Setup
- [ ] Install and configure react-i18next for React
- [ ] Create English translation files (en.json)
- [ ] Create Persian translation files (fa.json)
- [ ] Add language switcher component to header
- [ ] Implement RTL (Right-to-Left) layout support for Persian
- [ ] Create useLanguage hook for language management
- [ ] Store language preference in localStorage

## Phase 2: Persian Frontend Development
- [ ] Research Persian e-commerce UI patterns (Digikala, Torob, etc.)
- [ ] Create Persian CSS with RTL support
- [ ] Translate all pages to Persian:
  - [ ] Homepage
  - [ ] Products page
  - [ ] Product detail page
  - [ ] Cart page
  - [ ] Checkout page
  - [ ] Login/Register pages
  - [ ] Profile page
  - [ ] Orders page
  - [ ] Favorites page
- [ ] Add Persian fonts (Vazir, IRANSans, or Samim)
- [ ] Implement number formatting for Persian digits (۱۲۳۴)
- [ ] Add Persian date formatting

## Phase 3: Backend Persian Support
- [ ] Add Persian fields to models:
  - [ ] Product: name_fa, description_fa
  - [ ] Category: name_fa, description_fa
- [ ] Update serializers to include Persian fields
- [ ] Add language parameter to API endpoints (?lang=fa)
- [ ] Create Persian seed data

## Phase 4: Currency & Pricing
- [ ] Add IRR (Iranian Rial) and Toman currency support
- [ ] Implement currency switcher (USD/IRR/Toman)
- [ ] Add Persian number formatting for prices
- [ ] Update price display components

## Phase 5: Iranian Market Features
- [ ] Add Iranian phone number validation (+98 format)
- [ ] Create Iranian address structure (Province, City, Postal code)
- [ ] Add Iranian provinces and cities data
- [ ] Prepare for Iranian payment gateways (Zarinpal, Idpay)
- [ ] Add Persian calendar support

## Phase 6: UI/UX Improvements
- [ ] Add loading skeletons for all pages
- [ ] Improve mobile responsiveness
- [ ] Add toast notifications
- [ ] Implement smooth page transitions
- [ ] Add product quick view modal
- [ ] Improve accessibility (ARIA labels, keyboard navigation)

## Phase 7: Performance & SEO
- [ ] Implement React.lazy for code splitting
- [ ] Add meta tags for SEO
- [ ] Implement Open Graph tags for social sharing
- [ ] Add structured data (JSON-LD) for products
- [ ] Optimize images with lazy loading
- [ ] Add service worker for PWA support

## Phase 8: Testing & Quality
- [ ] Add Persian language tests
- [ ] Test RTL layout thoroughly
- [ ] Add unit tests for components
- [ ] Perform cross-browser testing
- [ ] Test mobile responsiveness

---

## Persian E-commerce Research Notes

### Popular Iranian Online Shops
1. **Digikala** (دیجیکالا) - Largest Iranian e-commerce
   - Clean, minimal design
   - Blue and white color scheme
   - Grid-based product listings
   - Advanced filtering system
   - Product comparison feature

2. **Torob** (ترب) - Price comparison
   - Simple, fast interface
   - Focus on price comparison
   - Clean product cards

3. **Bamilo** (بامیلو) - Fashion & lifestyle
   - Modern design
   - Large hero banners
   - Category-based navigation

4. **Modiseh** (مدیسه) - Fashion
   - Elegant design
   - High-quality product images
   - Persian typography focus

### Persian UI Patterns
- **RTL Layout**: Right-to-left text and layout
- **Persian Fonts**: Vazir, IRANSans, Samim, Shabnam
- **Number System**: Persian digits (۰۱۲۳۴۵۶۷۸۹)
- **Currency**: Toman (تومان) - 1 Toman = 10 Rials
- **Dates**: Persian (Jalali) calendar
- **Phone Numbers**: +98 format
- **Colors**: Blue (trust), Green (success), Red (sale)

### Persian Typography Best Practices
- Use web-safe Persian fonts
- Line height: 1.8-2.0 for readability
- Font size: 14px minimum for body text
- Proper letter spacing for Persian script

---

## Language File Structure

```
frontend/src/
├── i18n/
│   ├── index.js          # i18n configuration
│   ├── locales/
│   │   ├── en.json       # English translations
│   │   └── fa.json       # Persian translations
│   └── hooks/
│       └── useLanguage.js
├── components/
│   └── LanguageSwitcher.jsx
└── styles/
    ├── design-tokens.css
    ├── main.css
    └── rtl.css           # RTL specific styles
```

---

## Key Persian Translations

| English | Persian |
|---------|---------|
| Shop | فروشگاه |
| Products | محصولات |
| Cart | سبد خرید |
| Checkout | تکمیل خرید |
| Login | ورود |
| Register | ثبت‌نام |
| Profile | پروفایل |
| Orders | سفارش‌ها |
| Favorites | علاقه‌مندی‌ها |
| Search | جستجو |
| Price | قیمت |
| Free Shipping | ارسال رایگان |
| In Stock | موجود در انبار |
| Add to Cart | افزودن به سبد خرید |
| Knee | زانو |
| Ankle | مچ پا |
| Back | کمر |
| Shoulder | شانه |
| Wrist | مچ دست |
| Elbow | آرنج |

---

## Implementation Priority

1. **High Priority**: i18n setup, RTL support, Persian translations
2. **Medium Priority**: Persian fonts, number formatting, currency
3. **Low Priority**: Payment gateway, Persian calendar, PWA
