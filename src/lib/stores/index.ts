import { initCsvStore } from './csv'
import { initThemeStore } from './theme'
import { initTrxStore } from './trx'

export const themeStore = initThemeStore()
export const csvStore = initCsvStore()
export const trxStore = initTrxStore()
