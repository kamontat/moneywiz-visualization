import type { FilterBy, FilterByFunc } from './models'

export type TransferFilterMode = 'exclude-pure' | 'exclude-all' | 'only-pure'

export const byTransfer: FilterByFunc<[TransferFilterMode]> = (mode) => {
	const by: FilterBy = (trx) => {
		switch (mode) {
			case 'exclude-pure':
				return trx.type !== 'Transfer'
			case 'exclude-all':
				return trx.type !== 'Transfer' && trx.type !== 'CategorizedTransfer'
			case 'only-pure':
				return trx.type === 'Transfer'
			default:
				return true
		}
	}
	by.type = 'byTransfer'
	return by
}
