import { initFilterOptionsState } from './state'
import { initFilterOptionsStore } from './store'

export const filterOptionsState = initFilterOptionsState()
export const filterOptionsStore = initFilterOptionsStore(filterOptionsState)
