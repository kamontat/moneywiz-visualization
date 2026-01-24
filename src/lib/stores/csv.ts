import { writable } from 'svelte/store';
import type { ParsedCsv } from '$lib/csv';

export interface CsvState {
  fileName: string | null;
  data: ParsedCsv | null;
}

// Global store to hold the latest parsed CSV and its filename
export const csvStore = writable<CsvState>({ fileName: null, data: null });
