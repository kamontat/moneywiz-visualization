import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import { newEmptyState, newState } from '$utils/states'

export interface KcNtModeState {
	enabled: boolean
}

const normalize: StateNormalizeFn<KcNtModeState> = (state) => ({
	enabled: state?.enabled ?? false,
})

const equal: StateEqualFn<KcNtModeState> = (a, b) => {
	if (!a && !b) return true
	if (!a || !b) return false
	return a.enabled === b.enabled
}

export const initKcNtModeState = () => {
	const empty = newEmptyState<KcNtModeState>({ enabled: false })
	return newState(empty, { normalize, equal })
}
