import { initCsvStore } from './csv'
import { initThemeStore } from './theme'
import { initTrxStore } from './trx'

export const themeStore = await initThemeStore()
export const csvStore = await initCsvStore()
export const trxStore = await initTrxStore()
