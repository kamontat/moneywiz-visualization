import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as analytics from './analytics';
import * as finance from './finance';
import type { ParsedCsv } from './csv';

vi.mock('./finance', () => ({
    parseAmountTHB: vi.fn(),
    parseDateDDMMYYYY: vi.fn()
}));

const mockThbRows = [
    { Date: '01/01/2023', Amount: '100', Currency: 'THB', Category: 'Food' },
    { Date: '02/01/2023', Amount: '-50', Currency: 'THB', Category: 'Transport' },
    { Date: '03/01/2023', Amount: '200', Currency: 'THB', Category: 'Food' },
];

describe('analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTHBRows', () => {
        it('filters THB rows correctly', () => {
            const data: ParsedCsv = {
                headers: ['Currency', 'Amount'],
                rows: [
                    { Currency: 'THB', Amount: '100' },
                    { Currency: 'USD', Amount: '50' },
                    { Currency: 'thb', Amount: '20' } // case insensitive check based on implementation?
                    // Implementation says: (r['Currency'] || '').toUpperCase() === 'THB'
                ]
            };

            const result = analytics.getTHBRows(data);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Currency: 'THB', Amount: '100' });
            expect(result[1]).toEqual({ Currency: 'thb', Amount: '20' });
        });

        it('returns empty array if data is null', () => {
            expect(analytics.getTHBRows(null)).toEqual([]);
        });
    });

    describe('calculateTotals', () => {
        it('calculates income, expenses and net', () => {
            vi.mocked(finance.parseAmountTHB).mockImplementation((val) => Number(val));

            const rows = [
                { Amount: '100' },
                { Amount: '-40' },
                { Amount: '20' }
            ];

            const result = analytics.calculateTotals(rows);

            expect(result.income).toBe(120);
            expect(result.expenses).toBe(-40);
            expect(result.net).toBe(80);
            expect(result.count).toBe(3);
        });
    });

    describe('calculateTopCategories', () => {
        it('aggregates absolute amounts per category', () => {
             vi.mocked(finance.parseAmountTHB).mockImplementation((val) => Number(val));

             const rows = [
                 { Category: 'A', Amount: '-100' },
                 { Category: 'B', Amount: '50' },
                 { Category: 'A', Amount: '20' }
             ];

             const result = analytics.calculateTopCategories(rows);
             // A: |-100| + |20| = 120
             // B: |50| = 50

             expect(result.items).toEqual([
                 { name: 'A', value: 120 },
                 { name: 'B', value: 50 }
             ]);
             expect(result.max).toBe(120);
        });

        it('limits to top 5', () => {
            vi.mocked(finance.parseAmountTHB).mockImplementation((val) => Number(val));
            const rows = [
                { Category: '1', Amount: '10' },
                { Category: '2', Amount: '20' },
                { Category: '3', Amount: '30' },
                { Category: '4', Amount: '40' },
                { Category: '5', Amount: '50' },
                { Category: '6', Amount: '5' }
            ];

            const result = analytics.calculateTopCategories(rows);
            expect(result.items).toHaveLength(5);
            // Should be 5, 4, 3, 2, 1 descending
            expect(result.items[0].name).toBe('5');
            expect(result.items[4].name).toBe('1');
        });
    });

    describe('calculateDailyExpenses', () => {
        it('calculates daily expenses for the latest month', () => {
            vi.mocked(finance.parseDateDDMMYYYY).mockImplementation((val) => {
                const parts = val.split('/');
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            });
            vi.mocked(finance.parseAmountTHB).mockImplementation((val) => Number(val));

            // Latest date is 15/01/2023. Month is Jan 2023.
            const rows = [
                { Date: '15/01/2023', Amount: '-100' }, // Expense, Day 15
                { Date: '15/01/2023', Amount: '500' }, // Income (ignored by daily expenses?)
                // Implementation:
                // if (amt < 0) { const dayIdx = d.getDate() - 1; perDay[dayIdx] += Math.abs(amt); }
                // So income IS ignored.
                { Date: '01/01/2023', Amount: '-50' }, // Expense, Day 1
                { Date: '31/12/2022', Amount: '-200' }, // Previous year/month (ignored)
            ];

            const result = analytics.calculateDailyExpenses(rows);

            // Month 0 (Jan), Year 2023. Days in Jan is 31.
            expect(result.items).toHaveLength(31);

            // Day 1
            expect(result.items[0]).toEqual({ day: 1, value: 50 });
            // Day 15
            expect(result.items[14]).toEqual({ day: 15, value: 100 });

            expect(result.max).toBe(100);
            expect(result.label).toContain('2023');
        });

        it('returns empty structure if no dates found', () => {
            vi.mocked(finance.parseDateDDMMYYYY).mockReturnValue(null);
            const result = analytics.calculateDailyExpenses([{ Date: 'invalid' }]);
            expect(result.items).toEqual([]);
            expect(result.max).toBe(0);
        });
    });
});
