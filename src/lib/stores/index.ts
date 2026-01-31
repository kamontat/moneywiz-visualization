import {
	STORE_STATE_CSV_KEY,
	STORE_STATE_FLT_KEY,
	STORE_STATE_THM_KEY,
	STORE_STATE_TRX_KEY,
} from './constants'
import { csvFactory } from './csv'
import { filterFactory } from './filter'
import { createStore } from './store'
import { themeFactory } from './theme'
import { trxFactory } from './transaction'

export const csvStore = createStore(STORE_STATE_CSV_KEY, csvFactory)
export const trxStore = createStore(STORE_STATE_TRX_KEY, trxFactory)
export const filterStore = createStore(STORE_STATE_FLT_KEY, filterFactory)
export const themeStore = createStore(STORE_STATE_THM_KEY, themeFactory)

export type { ThemeName, ThemeData } from './theme'
