import { initCsvStore } from './csv'
import { initThemeStore } from './theme'
import { initTrxStore } from './trx'

const {
    themeStore,
    csvStore,
    trxStore,
} = await (async () => {
    const themeStore = await initThemeStore()
    const csvStore = await initCsvStore()
    const trxStore = await initTrxStore()
    return { themeStore, csvStore, trxStore }
})()

export { themeStore, csvStore, trxStore }
