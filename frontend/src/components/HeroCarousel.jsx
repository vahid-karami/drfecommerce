import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const AUTOPLAY_MS = 7000;

export default function HeroCarousel({ slides }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (count < 2 || paused || reduced) return undefined;
    const id = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, count, go]);

  if (!count) return null;

  return (
    <div
      className="hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('home.featuredSlides', 'معرفی محصولات')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-viewport">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className={`hero-slide ${i === index ? 'active' : ''}`}
            aria-hidden={i !== index}
            inert={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
          >
            <div className="hero-copy">
              <span className="hero-eyebrow">{s.eyebrow}</span>
              <h1 className="hero-title">{s.title}</h1>
              <p className="hero-text">{s.text}</p>
              <Link to={s.to} className="btn btn-primary btn-lg">{s.cta}</Link>
            </div>
            <div className="hero-media">
              <img src={s.image} alt="" />
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button className="hero-arrow prev" onClick={() => go(index - 1)} aria-label={t('home.prevSlide', 'اسلاید قبلی')}>
            <Icon name="chevronRight" className="flip-ltr" />
          </button>
          <button className="hero-arrow next" onClick={() => go(index + 1)} aria-label={t('home.nextSlide', 'اسلاید بعدی')}>
            <Icon name="chevronLeft" className="flip-ltr" />
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                key={s.key}
                className={i === index ? 'active' : ''}
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
