import type { FilterBy, FilterByFunc } from './models'
import { FILTER_TYPES } from './models'

export type TransferFilterMode = 'exclude' | 'only'

export const byTransfer: FilterByFunc<[TransferFilterMode]> = (mode) => {
	const by: FilterBy = (trx) => {
		switch (mode) {
			case 'exclude':
				return trx.type !== 'Transfer'
			case 'only':
				return trx.type === 'Transfer'
			default:
				return true
		}
	}
	by.type = FILTER_TYPES.TRANSFER
	return by
}
