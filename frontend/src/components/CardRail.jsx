import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

// Intro column + horizontally scrolling image cards ("shop by body part").
// size="lg" shows two larger cards per view instead of three.
export default function CardRail({ eyebrow, title, cta, items, variant = 'solid', size = 'md' }) {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    // scrollLeft is 0 at the start and negative towards the end in RTL.
    const scrolled = Math.abs(el.scrollLeft);
    setEdges({ start: scrolled < 4, end: scrolled + el.clientWidth >= el.scrollWidth - 4 });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [items.length]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const step = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: rtl ? -step : step, behavior: 'smooth' });
  };

  return (
    <div className="rail-layout">
      <div className="rail-intro">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {cta && <Link to={cta.to} className="btn btn-primary">{cta.label}</Link>}
        <div className="rail-arrows">
          <button onClick={() => scroll(-1)} disabled={edges.start} aria-label={t('home.scrollBack', 'قبلی')}>
            <Icon name="chevronRight" className="flip-ltr" />
          </button>
          <button onClick={() => scroll(1)} disabled={edges.end} aria-label={t('home.scrollForward', 'بعدی')}>
            <Icon name="chevronLeft" className="flip-ltr" />
          </button>
        </div>
      </div>

      <div className={`rail-track rail-${size}`} ref={trackRef} onScroll={updateEdges}>
        {items.map((item) => (
          <Link key={item.key} to={item.to} className={`rail-card rail-card-${variant}`}>
            <div className="rail-card-img">
              {item.image ? <img src={item.image} alt="" loading="lazy" /> : <Icon name="box" size={48} strokeWidth={1.2} />}
            </div>
            <div className="rail-card-label">
              <strong>{item.title}</strong>
              {item.subtitle && <span>{item.subtitle}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
