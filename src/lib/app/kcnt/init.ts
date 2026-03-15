import { initKcNtModeState } from './state'
import { initKcNtModeStore } from './store'

let store: ReturnType<typeof initKcNtModeStore> | null = null

export const getKcNtModeStore = () => {
	if (!store) {
		const state = initKcNtModeState()
		store = initKcNtModeStore(state)
	}
	return store
}
