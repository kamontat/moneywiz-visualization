import type { StoreFactory, StoreStateCsv } from '../models'

export const csvFactory: StoreFactory<StoreStateCsv> = {
	emptyState(key) {
		return {
			type: key,
			fileName: null,
			data: { headers: [], rows: [] },
		}
	},
	normalize(value) {
		return {
			type: value.type,
			fileName: value.fileName ?? null,
			data: {
				headers: Array.isArray(value.data?.headers) ? value.data.headers : [],
				rows: Array.isArray(value.data?.rows) ? value.data.rows : [],
			},
		}
	},
}
