import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as analytics from './analytics';
import * as finance from './finance';
import type { ParsedCsv } from './csv';

vi.mock('./finance', () => ({
    parseAmountTHB: vi.fn(),
    parseDateDDMMYYYY: vi.fn()
}));

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
                    { Currency: 'thb', Amount: '20' }
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
            (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));

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
            expect(result.savingRate).toBeCloseTo(66.67, 1);
        });

        it('handles zero income for saving rate', () => {
             (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));
             const rows = [{ Amount: '-50' }];
             const result = analytics.calculateTotals(rows);
             expect(result.income).toBe(0);
             expect(result.savingRate).toBe(0);
        });
    });

    describe('calculateTopCategories', () => {
        it('aggregates absolute amounts per category', () => {
             (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));

             const rows = [
                 { Category: 'A', Amount: '-100' },
                 { Category: 'B', Amount: '50' },
                 { Category: 'A', Amount: '20' }
             ];

             const result = analytics.calculateTopCategories(rows);

             expect(result.items).toEqual([
                 { name: 'A', value: 120 },
                 { name: 'B', value: 50 }
             ]);
             expect(result.max).toBe(120);
        });

        it('limits to top 5', () => {
            (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));
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
            expect(result.items[0].name).toBe('5');
            expect(result.items[4].name).toBe('1');
        });
    });

    describe('calculateDailyExpenses', () => {
        it('calculates daily expenses for the latest month', () => {
            (finance.parseDateDDMMYYYY as any).mockImplementation((val: any) => {
                const parts = val.split('/');
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            });
            (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));

            const rows = [
                { Date: '15/01/2023', Amount: '-100' },
                { Date: '15/01/2023', Amount: '500' },
                { Date: '01/01/2023', Amount: '-50' },
                { Date: '31/12/2022', Amount: '-200' },
            ];

            const result = analytics.calculateDailyExpenses(rows);

            expect(result.items).toHaveLength(31);
            expect(result.items[0]).toEqual({ day: 1, value: 50 });
            expect(result.items[14]).toEqual({ day: 15, value: 100 });
            expect(result.max).toBe(100);
            expect(result.label).toContain('2023');
        });

        it('returns empty structure if no dates found', () => {
            (finance.parseDateDDMMYYYY as any).mockReturnValue(null);
            const result = analytics.calculateDailyExpenses([{ Date: 'invalid' }]);
            expect(result.items).toEqual([]);
            expect(result.max).toBe(0);
        });
    });

    describe('getDateRange', () => {
        it('returns min and max dates', () => {
            (finance.parseDateDDMMYYYY as any).mockImplementation((val: any) => {
                const parts = val.split('/');
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            });

            const rows = [
                { Date: '15/01/2023' },
                { Date: '01/01/2023' },
                { Date: '20/02/2023' }
            ] as Record<string, string>[];

            const result = analytics.getDateRange(rows);
            expect(result).not.toBeNull();
            expect(result?.start.getDate()).toBe(1);
            expect(result?.start.getMonth()).toBe(0);
            expect(result?.end.getDate()).toBe(20);
            expect(result?.end.getMonth()).toBe(1);
        });

        it('returns null for empty valid dates', () => {
            (finance.parseDateDDMMYYYY as any).mockReturnValue(null);
            const result = analytics.getDateRange([{ Date: 'invalid' }] as Record<string, string>[]);
            expect(result).toBeNull();
        });
    });

    describe('calculateCategoryBreakdown', () => {
        it('separates income and expenses by category', () => {
            (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));
            const rows = [
                { Category: 'Work', Amount: '1000' },
                { Category: 'Work', Amount: '500' },
                { Category: 'Food', Amount: '-100' },
                { Category: 'Transport', Amount: '-50' },
                { Category: 'Food', Amount: '-20' }
            ];

            const result = analytics.calculateCategoryBreakdown(rows);

            expect(result.income).toHaveLength(1);
            expect(result.income[0]).toEqual({ name: 'Work', value: 1500 });
            
            expect(result.expenses).toHaveLength(2);
            expect(result.expenses[0]).toEqual({ name: 'Food', value: 120 });
            expect(result.expenses[1]).toEqual({ name: 'Transport', value: 50 });
        });

        it('handles uncategorized transactions', () => {
             (finance.parseAmountTHB as any).mockImplementation((val: any) => Number(val));
             const rows = [
                 { Category: '', Amount: '-100' }
             ];
             const result = analytics.calculateCategoryBreakdown(rows);
             expect(result.expenses[0].name).toBe('Uncategorized');
             expect(result.expenses[0].value).toBe(100);
        });
    });
});
