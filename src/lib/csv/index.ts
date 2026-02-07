import { writable } from 'svelte/store'

import { initCsvAPIs } from './apis'
import { initCsvState } from './state'
import { initCsvStore } from './store'

export { parseCsv, parseCsvFile } from './parser'

export const csvState = initCsvState()
export const csvStore = initCsvStore(csvState)
export const csvAPIs = initCsvAPIs(1, csvState, csvStore)

export const csvUploading = writable(false)
