import { describe, it, expect } from 'vitest';
import { formatDate, formatDateDisplay, getDateRange } from '../src/dateUtils.js';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a date object to YYYY-MM-DD string', () => {
      const date = new Date('2024-01-15T12:00:00');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should pad single digit month and day with zeros', () => {
      const date = new Date('2024-03-05T12:00:00');
      expect(formatDate(date)).toBe('2024-03-05');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2024-12-31T12:00:00');
      expect(formatDate(date)).toBe('2024-12-31');
    });

    it('should handle start of year dates', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(formatDate(date)).toBe('2024-01-01');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date string to human-readable format', () => {
      const result = formatDateDisplay('2024-01-15');
      expect(result).toBe('Monday, January 15, 2024');
    });

    it('should handle different months', () => {
      const result = formatDateDisplay('2024-12-25');
      expect(result).toBe('Wednesday, December 25, 2024');
    });

    it('should handle leap year dates', () => {
      const result = formatDateDisplay('2024-02-29');
      expect(result).toBe('Thursday, February 29, 2024');
    });
  });

  describe('getDateRange', () => {
    it('should return array of dates for a single day', () => {
      const result = getDateRange('2024-01-15', '2024-01-15');
      expect(result).toEqual(['2024-01-15']);
    });

    it('should return array of dates for a multi-day range', () => {
      const result = getDateRange('2024-01-15', '2024-01-17');
      expect(result).toEqual([
        '2024-01-15',
        '2024-01-16',
        '2024-01-17'
      ]);
    });

    it('should handle month boundaries', () => {
      const result = getDateRange('2024-01-30', '2024-02-02');
      expect(result).toEqual([
        '2024-01-30',
        '2024-01-31',
        '2024-02-01',
        '2024-02-02'
      ]);
    });

    it('should handle year boundaries', () => {
      const result = getDateRange('2023-12-30', '2024-01-02');
      expect(result).toEqual([
        '2023-12-30',
        '2023-12-31',
        '2024-01-01',
        '2024-01-02'
      ]);
    });

    it('should handle leap year February', () => {
      const result = getDateRange('2024-02-28', '2024-03-01');
      expect(result).toEqual([
        '2024-02-28',
        '2024-02-29',
        '2024-03-01'
      ]);
    });

    it('should return correct count of dates for a week', () => {
      const result = getDateRange('2024-01-15', '2024-01-21');
      expect(result).toHaveLength(7);
    });
  });
});
