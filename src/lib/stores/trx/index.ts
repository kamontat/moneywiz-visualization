import type { StoreFactory, StoreState } from '../models'
import type { ParsedTransaction } from '$lib/transactions'
import { STORE_STATE_TRX_KEY } from '../constants'

export interface StoreStateTrx extends StoreState<typeof STORE_STATE_TRX_KEY, ParsedTransaction[]> {
	fileName: string | null
}

export const trxFactory: StoreFactory<StoreStateTrx> = {
	emptyState: {
		type: STORE_STATE_TRX_KEY,
		fileName: null,
		data: [],
	},
	normalize(value) {
		return {
			type: value?.type ?? STORE_STATE_TRX_KEY,
			fileName: value?.fileName ?? null,
			data: value?.data ?? [],
		}
	},
}
