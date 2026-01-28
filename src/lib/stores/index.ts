import { STORE_STATE_CSV_KEY } from './constants'
import { csvFactory } from './csv'
import { createStore } from './store'

export const csvStore = createStore(STORE_STATE_CSV_KEY, csvFactory)
