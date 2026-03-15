import type { KcNtModeState } from './state'
import { describe, it, expect } from 'vitest'

import { initKcNtModeState } from './state'

describe('KcNtModeState', () => {
	it('normalizes undefined state to default', () => {
		const state = initKcNtModeState()
		const normalized = state.normalize({ enabled: false })
		expect(normalized).toEqual({ enabled: false })
	})

	it('normalizes state with enabled true', () => {
		const state = initKcNtModeState()
		const normalized = state.normalize({ enabled: true })
		expect(normalized).toEqual({ enabled: true })
	})

	it('normalizes state with enabled false', () => {
		const state = initKcNtModeState()
		const normalized = state.normalize({ enabled: false })
		expect(normalized).toEqual({ enabled: false })
	})

	it('returns true when both states are equal', () => {
		const state = initKcNtModeState()
		const stateA: KcNtModeState = { enabled: true }
		const stateB: KcNtModeState = { enabled: true }
		expect(state.equal(stateA, stateB)).toBe(true)
	})

	it('returns true when both states are disabled', () => {
		const state = initKcNtModeState()
		const stateA: KcNtModeState = { enabled: false }
		const stateB: KcNtModeState = { enabled: false }
		expect(state.equal(stateA, stateB)).toBe(true)
	})

	it('returns false when states differ', () => {
		const state = initKcNtModeState()
		const stateA: KcNtModeState = { enabled: true }
		const stateB: KcNtModeState = { enabled: false }
		expect(state.equal(stateA, stateB)).toBe(false)
	})

	it('normalizes with null state', () => {
		const state = initKcNtModeState()
		const normalized = state.normalize(null as unknown as KcNtModeState)
		expect(normalized).toEqual({ enabled: false })
	})
})
