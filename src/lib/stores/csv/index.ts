import type { ParsedCsv } from '$lib/csv'
import type { StoreFactory, StoreState } from '../models'
import { STORE_STATE_CSV_KEY } from '../constants'

export interface StoreStateCsv extends StoreState<typeof STORE_STATE_CSV_KEY, ParsedCsv> {
	fileName: string | null
}

export const csvFactory: StoreFactory<StoreStateCsv> = {
	emptyState: {
		type: STORE_STATE_CSV_KEY,
		fileName: null,
		data: { headers: [], rows: [] },
	},
	normalize(value) {
		return {
			type: value?.type ?? STORE_STATE_CSV_KEY,
			fileName: value?.fileName ?? null,
			data: {
				headers: Array.isArray(value?.data?.headers) ? value.data.headers : [],
				rows: Array.isArray(value?.data?.rows) ? value.data.rows : [],
			},
		}
	},
}
