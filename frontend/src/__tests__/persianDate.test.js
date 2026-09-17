import { describe, it, expect } from 'vitest';
import { toPersianNumber, toPersianDate, formatDate, formatDateTime } from '../utils/persianDate';

describe('persianDate utility', () => {
  describe('toPersianNumber', () => {
    it('converts English digits to Persian', () => {
      expect(toPersianNumber('12345')).toBe('۱۲۳۴۵');
      expect(toPersianNumber(67890)).toBe('۶۷۸۹۰');
    });

    it('returns empty string for null/undefined', () => {
      expect(toPersianNumber(null)).toBe('');
      expect(toPersianNumber(undefined)).toBe('');
    });

    it('handles mixed strings', () => {
      expect(toPersianNumber('Price: 100')).toBe('Price: ۱۰۰');
    });
  });

  describe('toPersianDate', () => {
    it('formats date as Persian date string with Persian digits', () => {
      const date = new Date('2024-01-15');
      const result = toPersianDate(date);
      expect(result).toContain('۲۰۲۴');
      expect(result).toContain('۱۵');
    });

    it('returns empty string for invalid date', () => {
      expect(toPersianDate('invalid')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats date in English', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'en');
      expect(result).toMatch(/January/);
    });

    it('formats date in Persian', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'fa');
      expect(result).toMatch(/فروردین|دی|بهمن|اسفند/);
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime in English', () => {
      const date = new Date();
      const result = formatDateTime(date, 'en');
      expect(result).toBeTruthy();
    });

    it('formats datetime in Persian', () => {
      const date = new Date();
      const result = formatDateTime(date, 'fa');
      expect(result).toBeTruthy();
    });
  });
});
