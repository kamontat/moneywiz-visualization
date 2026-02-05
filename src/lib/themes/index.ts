import { system, themeMap, themeList } from './constants'
import { initThemeState } from './state'
import { initThemeStore } from './store'

export const themeState = initThemeState()
export const themeStore = initThemeStore(themeState)
export { system, themeMap, themeList }
