import { describe, it, expect } from 'vitest'
import { csvStore, trxStore, filterStore } from './index'

describe('stores index', () => {
	it('should export initialized stores', () => {
		expect(csvStore).toBeDefined()
		expect(trxStore).toBeDefined()
		expect(filterStore).toBeDefined()

		expect(csvStore.subscribe).toBeDefined()
		expect(trxStore.subscribe).toBeDefined()
		expect(filterStore.subscribe).toBeDefined()
	})
})
