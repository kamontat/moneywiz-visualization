import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock localStorage and window
const storeData = new Map<string, string>();
const localStorageMock = {
    getItem: (key: string) => storeData.get(key) || null,
    setItem: (key: string, value: string) => storeData.set(key, value),
    removeItem: (key: string) => storeData.delete(key),
    clear: () => storeData.clear(),
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('window', {});

import { csvStore, type CsvState } from './csv';

describe('csvStore', () => {
    beforeEach(() => {
        storeData.clear();
        csvStore.reset();
        vi.clearAllMocks();
        
        // We need to re-spy because mocks might be cleared? 
        // Or just spy directly on the global object's methods if they were genuine methods.
        // Since we allow real implementation, we can spy on the methods of localStorageMock but we assigned it to global.
        vi.spyOn(localStorage, 'setItem');
        vi.spyOn(localStorage, 'removeItem');
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

    it('persists to localStorage when set', () => {
        const newData: CsvState = {
            fileName: 'persist.csv',
            data: {
                headers: ['A'],
                rows: [{ A: '1' }]
            }
        };

        csvStore.set(newData);

        expect(localStorage.setItem).toHaveBeenCalledWith('mw_csv_data', JSON.stringify(newData));
        expect(localStorage.getItem('mw_csv_data')).toBe(JSON.stringify(newData));
    });

    it('removes from localStorage when reset', () => {
        csvStore.set({
            fileName: 'test.csv',
            data: { headers: [], rows: [] }
        });

        expect(localStorage.getItem('mw_csv_data')).not.toBeNull();

        csvStore.reset();

        expect(localStorage.removeItem).toHaveBeenCalledWith('mw_csv_data');
        expect(localStorage.getItem('mw_csv_data')).toBeNull();
        
        const state = get(csvStore);
        expect(state.fileName).toBeNull();
        expect(state.data).toBeNull();
    });
});

