import { writable } from 'svelte/store'

import { initDatabaseAPIs } from './apis'
import { initDatabaseState } from './state'
import { initDatabaseStore } from './store'

export const databaseState = initDatabaseState()
export const databaseStore = initDatabaseStore(databaseState)
export const databaseAPIs = initDatabaseAPIs(1, databaseStore)

export const databaseUploading = writable(false)
