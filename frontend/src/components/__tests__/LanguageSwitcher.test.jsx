import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders English and Persian buttons', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('فا')).toBeInTheDocument();
  });

  it('applies active class to current language button', () => {
    const { container } = render(<LanguageSwitcher />);
    const enButton = container.querySelector('.lang-btn.active');
    expect(enButton).toHaveTextContent('EN');
  });

  it('calls changeLanguage when Persian button is clicked', () => {
    const { container } = render(<LanguageSwitcher />);
    const faButton = Array.from(container.querySelectorAll('.lang-btn')).find(
      (btn) => btn.textContent === 'فا'
    );
    fireEvent.click(faButton);
  });
});
