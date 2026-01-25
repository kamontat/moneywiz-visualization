import { writable } from 'svelte/store';
import type { ParsedCsv } from '$lib/csv';
import { log } from '$lib/debug';

export interface CsvState {
  fileName: string | null;
  data: ParsedCsv | null;
}

const STORAGE_KEY = 'mw_csv_data';

function createCsvStore() {
  // Hydrate from localStorage if available
  let initialState: CsvState = { fileName: null, data: null };
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        initialState = JSON.parse(stored);
        log.storeCsv('hydrated from localStorage: fileName=%s', initialState.fileName);
      }
    } catch (e) {
      log.storeCsv('failed to hydrate from localStorage', e);
    }
  }

  const { subscribe, set, update } = writable<CsvState>(initialState);

  const saveToStorage = (value: CsvState) => {
    if (typeof window !== 'undefined') {
      try {
        if (value.data && value.fileName) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        log.storeCsv('failed to persist to localStorage', e);
      }
    }
  };

  return {
    subscribe,
    set: (value: CsvState) => {
      log.storeCsv('setting store: fileName=%s, rows=%d', value.fileName, value.data?.rows.length ?? 0);
      saveToStorage(value);
      set(value);
    },
    update: (updater) => {
      update((value) => {
        const next = updater(value);
        saveToStorage(next);
        return next;
      });
    },
    reset: () => {
      log.storeCsv('resetting store');
      // This implicitly calls our custom set, which handles storage removal
      saveToStorage({ fileName: null, data: null });
      set({ fileName: null, data: null });
    }
  };
}

// Global store to hold the latest parsed CSV and its filename
export const csvStore = createCsvStore();
log.store('csv store initialized');
