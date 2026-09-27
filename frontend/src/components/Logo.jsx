import { Link } from 'react-router-dom';

// SportMed wordmark: a rounded "joint" mark (two arcs around a hinge) + Persian name.
export default function Logo({ onClick }) {
  return (
    <Link to="/" className="brand" aria-label="اسپورت‌مد - صفحه اصلی" onClick={onClick}>
      <svg className="brand-mark" width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="currentColor" />
        <path d="M11 13.5c3.5-3 14.5-3 18 0" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <path d="M11 26.5c3.5 3 14.5 3 18 0" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="20" r="3.4" fill="#5fd0de" />
      </svg>
      <span className="brand-text">
        <span className="brand-name">اسپورت‌مد</span>
        <span className="brand-latin">SPORTMED</span>
      </span>
    </Link>
  );
}
