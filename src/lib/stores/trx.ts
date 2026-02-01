import type { ParsedTransactions } from '$lib/transactions'
import { indexDBV1 } from './db'
import { newStore, STORE_STATE_TRX_KEY_V1, type StateNormal } from './internal'

import { store } from '$lib/loggers'

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
			const fileName = await db.get(STORE_STATE_TRX_KEY_V1, 'fileName')
			// TODO: Fix getAll also include the key 'fileName'
			const data = await db.getAll(STORE_STATE_TRX_KEY_V1)
			console.log(fileName, data)
			return { fileName, data } as TrxState
		},
		setVal: async (db, state) => {
			const trx = db.transaction(STORE_STATE_TRX_KEY_V1, 'readwrite')
			await Promise.all([
				trx.store.put(state.fileName, 'fileName'),
				...state.data.map((item, index) =>
					trx.store.put(item, `transaction/${index}`)
				),
				trx.done,
			])
		},
		delVal: async (db) => {
			const trx = db.transaction(STORE_STATE_TRX_KEY_V1, 'readwrite')
			await Promise.all([trx.store.clear(), trx.done])
		},
		log,
	})
}
