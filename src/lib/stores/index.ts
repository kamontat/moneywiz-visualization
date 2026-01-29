import { STORE_STATE_CSV_KEY, STORE_STATE_FLT_KEY, STORE_STATE_TRX_KEY } from './constants'
import { csvFactory } from './csv'
import { filterFactory } from './flt'
import { createStore } from './store'
import { trxFactory } from './trx'

export const csvStore = createStore(STORE_STATE_CSV_KEY, csvFactory)
export const trxStore = createStore(STORE_STATE_TRX_KEY, trxFactory)
export const filterStore = createStore(STORE_STATE_FLT_KEY, filterFactory)
