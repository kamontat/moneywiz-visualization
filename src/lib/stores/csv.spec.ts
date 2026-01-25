import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { csvStore, type CsvState } from './csv';

describe('csvStore', () => {
    beforeEach(() => {
        csvStore.reset();
    });

    it('initializes with null state', () => {
        const state = get(csvStore);
        expect(state.fileName).toBeNull();
        expect(state.data).toBeNull();
    });

    it('updates state via set', () => {
        const newData: CsvState = {
            fileName: 'test.csv',
            data: {
                headers: ['Col1'],
                rows: [{ Col1: 'Val1' }]
            }
        };

        csvStore.set(newData);

        const state = get(csvStore);
        expect(state).toEqual(newData);
    });

    it('resets state', () => {
        csvStore.set({
            fileName: 'test.csv',
            data: { headers: [], rows: [] }
        });

        // Verify set worked
        expect(get(csvStore).fileName).toBe('test.csv');

        csvStore.reset();

        const state = get(csvStore);
        expect(state.fileName).toBeNull();
        expect(state.data).toBeNull();
    });
});
