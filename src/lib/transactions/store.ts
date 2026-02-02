import type { ParsedTransactions } from '$lib/transactions'
import { store } from '$lib/loggers'
import {
	newStore,
	indexDBV1,
	STORE_STATE_TRX_KEY_V1,
	type StateNormal,
} from '$lib/stores'

type TrxState = ParsedTransactions

// Support load only partial data
export const initTrxStore = () => {
	const log = store.extends('transaction')
	const empty: TrxState = {
		fileName: null,
		data: [],
	}

	const normalize: StateNormal<TrxState> = (state) => {
		return {
			fileName: state?.fileName ?? null,
			data: state?.data ?? [],
		}
	}

	return newStore(indexDBV1, empty, {
		normalize,
		getVal: async (db) => {
			const trx = await db.transaction(STORE_STATE_TRX_KEY_V1)
			const fileName = await trx.store.get('fileName')
			// TODO: Fix getAll also include the key 'fileName'
			const data = (await trx.store.getAll()).filter(
				(item) => item !== undefined && item !== null
			)
			await trx.done

			return { fileName, data } as TrxState
		},
		setVal: async (db, state) => {
			const trx = await db.transaction(STORE_STATE_TRX_KEY_V1, 'readwrite')
			await Promise.all([
				trx.store.put(state.fileName, 'fileName'),
				...state.data.map((item, index) =>
					trx.store.put(item, `transaction/${index}`)
				),
				trx.done,
			])
		},
		delVal: async (db) => {
			const trx = await db.transaction(STORE_STATE_TRX_KEY_V1, 'readwrite')
			await Promise.all([trx.store.clear(), trx.done])
		},
		log,
	})
}
