import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer digikala-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-support">
            <h3>تماس با پشتیبانی</h3>
            <p>شماره تماس: <span>۰۲۱-۱۲۳۴۵۶۷۸</span> | هفت روز هفته، ۲۴ ساعت شبانه‌روز پاسخگوی شما هستیم.</p>
          </div>
          <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            بازگشت به بالا ^
          </button>
        </div>

        <div className="footer-main">
          <div className="footer-col">
            <h4>با اسپورت‌مد</h4>
            <ul>
              <li><Link to="/about">درباره ما</Link></li>
              <li><Link to="/contact">تماس با ما</Link></li>
              <li><Link to="/careers">فرصت‌های شغلی</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>خدمات مشتریان</h4>
            <ul>
              <li><Link to="/faq">پاسخ به پرسش‌های متداول</Link></li>
              <li><Link to="/return-policy">رویه‌های بازگرداندن کالا</Link></li>
              <li><Link to="/privacy">حریم خصوصی</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>راهنمای خرید</h4>
            <ul>
              <li><Link to="/how-to-buy">نحوه ثبت سفارش</Link></li>
              <li><Link to="/shipping">رویه ارسال سفارش</Link></li>
              <li><Link to="/payment">شیوه‌های پرداخت</Link></li>
            </ul>
          </div>
          <div className="footer-col trust-seals-col">
            <h4>نمادهای اعتماد</h4>
            <div className="trust-seals">
              <div className="seal-placeholder">نماد اعتماد الکترونیکی</div>
              <div className="seal-placeholder">نشان ملی ثبت رسانه‌ها</div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>استفاده از مطالب فروشگاه اینترنتی اسپورت‌مد فقط برای مقاصد غیرتجاری و با ذکر منبع بلامانع است. کلیه حقوق این سایت متعلق به اسپورت‌مد می‌باشد.</p>
        </div>
      </div>
    </footer>
  );
}
