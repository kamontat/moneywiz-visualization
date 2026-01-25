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

    describe('filterByDateRange', () => {
        beforeEach(() => {
             (finance.parseDateDDMMYYYY as any).mockImplementation((val: any) => {
                if (!val) return null;
                const parts = val.split('/');
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            });
        });

        it('returns all rows if no date filter', () => {
             const rows = [{ Date: '01/01/2023' }] as Record<string, string>[];
             const result = analytics.filterByDateRange(rows, null, null);
             expect(result).toHaveLength(1);
        });

        it('filters by start date', () => {
             const rows = [
                 { Date: '01/01/2023' },
                 { Date: '15/01/2023' },
                 { Date: '20/01/2023' }
             ] as Record<string, string>[];
             const start = new Date(2023, 0, 15); // Jan 15

             const result = analytics.filterByDateRange(rows, start, null);
             expect(result).toHaveLength(2);
             expect(result[0].Date).toBe('15/01/2023');
             expect(result[1].Date).toBe('20/01/2023');
        });

        it('filters by end date', () => {
             const rows = [
                 { Date: '01/01/2023' },
                 { Date: '15/01/2023' },
                 { Date: '20/01/2023' }
             ] as Record<string, string>[];
             const end = new Date(2023, 0, 15); // Jan 15

             const result = analytics.filterByDateRange(rows, null, end);
             expect(result).toHaveLength(2);
             expect(result[0].Date).toBe('01/01/2023');
             expect(result[1].Date).toBe('15/01/2023');
        });

        it('filters by range', () => {
             const rows = [
                 { Date: '01/01/2023' },
                 { Date: '10/01/2023' },
                 { Date: '20/01/2023' }
             ] as Record<string, string>[];
             const start = new Date(2023, 0, 5);
             const end = new Date(2023, 0, 15);

             const result = analytics.filterByDateRange(rows, start, end);
             expect(result).toHaveLength(1);
             expect(result[0].Date).toBe('10/01/2023');
        });

        it('excludes rows with invalid dates', () => {
            (finance.parseDateDDMMYYYY as any).mockReturnValue(null);
            const rows = [{ Date: 'invalid' }] as Record<string, string>[];
            const result = analytics.filterByDateRange(rows, new Date(), null);
            expect(result).toHaveLength(0);
        });
    });

    describe('parseTagsFromField', () => {
        it('parses single tag entry', () => {
            const result = analytics.parseTagsFromField('Group: KcNt; ');
            expect(result).toEqual({ Group: 'KcNt' });
        });

        it('parses multiple tag entries', () => {
            const result = analytics.parseTagsFromField('Group: KcNt; Type: Personal; ');
            expect(result).toEqual({ Group: 'KcNt', Type: 'Personal' });
        });

        it('handles empty or missing tags', () => {
            expect(analytics.parseTagsFromField('')).toEqual({});
            expect(analytics.parseTagsFromField('   ')).toEqual({});
        });

        it('handles malformed entries', () => {
            // Missing value
            expect(analytics.parseTagsFromField('Group:;')).toEqual({});
            // Missing category
            expect(analytics.parseTagsFromField(':Value;')).toEqual({});
            // No colon
            expect(analytics.parseTagsFromField('JustText;')).toEqual({});
        });

        it('handles value with colons', () => {
             const result = analytics.parseTagsFromField('Time: 12:00 PM; ');
             expect(result).toEqual({ Time: '12:00 PM' });
        });
    });

    describe('parseAllTags', () => {
        it('extracts unique categories and values', () => {
            const rows = [
                { Tags: 'Group: A; Type: X;' },
                { Tags: 'Group: B; Type: X;' },
                { Tags: 'Group: A; Status: Active;' }
            ] as Record<string, string>[];

            const result = analytics.parseAllTags(rows);

            expect(result.size).toBe(3);
            expect(result.get('Group')).toEqual(new Set(['A', 'B']));
            expect(result.get('Type')).toEqual(new Set(['X']));
            expect(result.get('Status')).toEqual(new Set(['Active']));
        });

        it('ignores empty tags', () => {
            const rows = [
                { Tags: '' },
                { Tags: 'Group: A;' },
                { foo: 'bar' } // No Tags field
            ] as Record<string, string>[];

            const result = analytics.parseAllTags(rows);
            expect(result.size).toBe(1);
            expect(result.get('Group')).toEqual(new Set(['A']));
        });
    });

    describe('filterByTags', () => {
        const rows = [
            { id: '1', Tags: 'Group: A; Type: X;' },
            { id: '2', Tags: 'Group: B; Type: Y;' },
            { id: '3', Tags: 'Group: C; Type: X;' },
            { id: '4', Tags: 'Group: A; Type: Y;' },
            { id: '5', Tags: '' }
        ] as Record<string, string>[];

        it('returns all rows if no filters', () => {
            const result = analytics.filterByTags(rows, []);
            expect(result).toHaveLength(5);
        });

        it('filters by include mode', () => {
            const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['A'], mode: 'include' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(2);
            expect(result.map(r => r.id).sort()).toEqual(['1', '4']);
        });

        it('filters by include mode with multiple values (OR logic)', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['A', 'B'], mode: 'include' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(3);
            expect(result.map(r => r.id).sort()).toEqual(['1', '2', '4']);
        });

        it('filters by exclude mode', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['A'], mode: 'exclude' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(3);
            expect(result.map(r => r.id).sort()).toEqual(['2', '3', '5']);
        });

        it('filters by exclude mode with multiple values', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['A', 'B'], mode: 'exclude' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(2); // C and empty
            expect(result.map(r => r.id).sort()).toEqual(['3', '5']);
        });

        it('combines multiple filters with AND logic', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['A', 'B'], mode: 'include' }, // Keeps 1, 2, 4
                { category: 'Type', values: ['X'], mode: 'include' }        // Keeps 1, 3
            ];
            // Intersection of (1,2,4) and (1,3) is (1)
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('handles exclude logic combined with include', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Type', values: ['X', 'Y'], mode: 'include' }, // Keeps 1, 2, 3, 4
                { category: 'Group', values: ['A'], mode: 'exclude' }      // Excludes 1, 4
            ];
            // Result should be 2, 3
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(2);
            expect(result.map(r => r.id).sort()).toEqual(['2', '3']);
        });

        it('returns empty if include filter matches nothing', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['Z'], mode: 'include' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(0);
        });

        it('returns all if exclude filter matches nothing', () => {
             const filters: analytics.TagFilter[] = [
                { category: 'Group', values: ['Z'], mode: 'exclude' }
            ];
            const result = analytics.filterByTags(rows, filters);
            expect(result).toHaveLength(5);
        });
    });
});

