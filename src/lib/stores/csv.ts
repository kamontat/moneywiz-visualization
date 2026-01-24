import { writable } from 'svelte/store';
import type { ParsedCsv } from '$lib/csv';
import { log } from '$lib/debug';

export interface CsvState {
  fileName: string | null;
  data: ParsedCsv | null;
}

function createCsvStore() {
  const { subscribe, set, update } = writable<CsvState>({ fileName: null, data: null });

  return {
    subscribe,
    set: (value: CsvState) => {
      log.storeCsv('setting store: fileName=%s, rows=%d', value.fileName, value.data?.rows.length ?? 0);
      set(value);
    },
    update,
    reset: () => {
      log.storeCsv('resetting store');
      set({ fileName: null, data: null });
    }
  };
}

// Global store to hold the latest parsed CSV and its filename
export const csvStore = createCsvStore();
log.store('csv store initialized');
