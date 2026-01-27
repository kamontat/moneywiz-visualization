import { writable } from 'svelte/store';
import type { ParsedCsv } from '$lib/csv';
import type { TagFilter } from '$lib/analytics';
import { log } from '$lib/debug';

export interface CsvState {
	fileName: string | null;
	data: ParsedCsv | null;
	tagFilters: TagFilter[];
}

const STORAGE_KEY = 'mw_csv_data';

function createCsvStore() {
	const normalize = (value: CsvState): CsvState => ({
		fileName: value.fileName ?? null,
		data: value.data ?? null,
		tagFilters: value.tagFilters ?? [],
	});

	// Hydrate from localStorage if available
	let initialState: CsvState = { fileName: null, data: null, tagFilters: [] };
	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Ensure legacy data gets empty filters
				initialState = {
					...parsed,
					tagFilters: parsed.tagFilters || [],
				};
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

	const customSet = (value: CsvState) => {
		const next = normalize(value);
		log.storeCsv('setting store: fileName=%s, rows=%d', next.fileName, next.data?.rows.length ?? 0);
		saveToStorage(next);
		set(next);
	};

	return {
		subscribe,
		set: customSet,
		update: (updater: (value: CsvState) => CsvState) => {
			update((value) => {
				const next = normalize(updater(value));
				saveToStorage(next);
				return next;
			});
		},
		reset: () => {
			log.storeCsv('resetting store');
			customSet({ fileName: null, data: null, tagFilters: [] });
		},
		setTagFilters: (filters: TagFilter[]) => {
			log.storeCsv('updating tag filters: %d filters', filters.length);
			update((state) => {
				const next = { ...state, tagFilters: filters };
				saveToStorage(next);
				return next;
			});
		},
		clearTagFilters: () => {
			log.storeCsv('clearing tag filters');
			update((state) => {
				const next = { ...state, tagFilters: [] };
				saveToStorage(next);
				return next;
			});
		},
	};
}

// Global store to hold the latest parsed CSV and its filename
export const csvStore = createCsvStore();
log.store('csv store initialized');
