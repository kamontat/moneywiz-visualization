import type { StoreFactory, StoreState } from '../models'
import { STORE_STATE_FLT_KEY } from '../constants'

// TODO: Implement filter object structure
export type StoreStateFlt = StoreState<typeof STORE_STATE_FLT_KEY, undefined>

export const filterFactory: StoreFactory<StoreStateFlt> = {
	emptyState: {
		type: STORE_STATE_FLT_KEY,
		data: undefined,
	},
	normalize(value) {
		return {
			type: value?.type ?? STORE_STATE_FLT_KEY,
			data: value?.data ?? undefined,
		}
	},
}
