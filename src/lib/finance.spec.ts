import { describe, it, expect } from 'vitest';
import { parseAmountTHB, parseDateDDMMYYYY, formatTHB } from './finance';

describe('finance', () => {
    describe('parseAmountTHB', () => {
        it('parses valid positive numbers', () => {
            expect(parseAmountTHB('1,234.56')).toBe(1234.56);
            expect(parseAmountTHB('100')).toBe(100);
            expect(parseAmountTHB('0.99')).toBe(0.99);
        });

        it('parses negative numbers', () => {
            expect(parseAmountTHB('-1,234.56')).toBe(-1234.56);
            expect(parseAmountTHB('-500')).toBe(-500);
        });

        it('handles inputs with spaces', () => {
             expect(parseAmountTHB(' 1, 234.56 ')).toBe(1234.56);
        });

        it('returns 0 for invalid inputs', () => {
            expect(parseAmountTHB('abc')).toBe(0);
            expect(parseAmountTHB('')).toBe(0);
        });
    });

    describe('parseDateDDMMYYYY', () => {
        it('parses valid dates', () => {
            const date = parseDateDDMMYYYY('25/01/2026');
            expect(date).not.toBeNull();
            expect(date?.getFullYear()).toBe(2026);
            expect(date?.getMonth()).toBe(0); // January is 0
            expect(date?.getDate()).toBe(25);
        });

        it('returns null for invalid format', () => {
            expect(parseDateDDMMYYYY('2026-01-25')).toBeNull();
            expect(parseDateDDMMYYYY('invalid')).toBeNull();
            expect(parseDateDDMMYYYY('')).toBeNull();
        });

        it('returns valid date object for leap year', () => {
             const date = parseDateDDMMYYYY('29/02/2024');
             expect(date).not.toBeNull();
             expect(date?.getFullYear()).toBe(2024);
             expect(date?.getMonth()).toBe(1);
             expect(date?.getDate()).toBe(29);
        });
    });

    describe('formatTHB', () => {
        it('formats numbers as THB currency', () => {
            // Note: Output depends on locale, but typically includes symbol or code
             const formatted = formatTHB(1234.56);
             // We check loosely because actual string depends on environment locale (e.g. THB 1,234.56 or ฿1,234.56)
             // But we verify it contains the numbers and separators
             expect(formatted).toContain('1,234.56');
             expect(formatted).toMatch(/THB|฿/);
        });
    });
});
