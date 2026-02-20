import type { FilterState } from './models'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
	loadPersistedFilterSelection,
	persistFilterSelection,
} from './filterSelectionPersistence'
import { emptyFilterState } from './models/state'

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}

// Setup global window mock
if (typeof window === 'undefined') {
	global.window = { localStorage: localStorageMock } as any
} else {
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
		writable: true,
	})
}

describe('filterSelectionPersistence', () => {
	const storageKey = 'moneywiz:filters:selection:v1'

	beforeEach(() => {
		// Reset mocks before each test
		localStorageMock.getItem.mockReturnValue(null)
		localStorageMock.setItem.mockClear()
		localStorageMock.removeItem.mockClear()
		localStorageMock.clear.mockClear()
	})

	afterEach(() => {
		// Reset mocks after each test
		vi.restoreAllMocks()
	})

	it('should return undefined when no persisted data exists', () => {
		const result = loadPersistedFilterSelection()
		expect(result).toBeUndefined()
	})

	it('should persist and load filter selection', () => {
		const filterState: FilterState = {
			...emptyFilterState(),
			dateRange: { start: undefined, end: undefined },
			payees: ['Test Payee', 'Another Payee'],
			accounts: ['Test Account'],
			categories: ['Food > Restaurant'],
			categoryMode: 'exclude',
			transactionTypes: ['Expense'],
			tags: [
				{
					category: 'Event',
					values: ['Birthday', 'Holiday'],
					mode: 'include',
				},
			],
		}

		// Mock localStorage getItem to return the persisted data
		localStorageMock.getItem.mockImplementation((key) => {
			if (key === storageKey) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { dateRange, ...filterSelection } = filterState
				return JSON.stringify(filterSelection)
			}
			return null
		})

		// Persist the filter state (excluding dateRange)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { dateRange, ...filterSelection } = filterState
		persistFilterSelection(filterSelection)

		// Verify localStorage.setItem was called with correct data (order doesn't matter in JSON)
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			storageKey,
			expect.stringContaining('"payees":["Test Payee","Another Payee"]')
		)
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			storageKey,
			expect.stringContaining('"accounts":["Test Account"]')
		)

		// Load and verify
		const loaded = loadPersistedFilterSelection()
		expect(loaded).toEqual(filterSelection)
	})

	it('should handle empty filter selection', () => {
		const filterState: FilterState = {
			...emptyFilterState(),
			dateRange: { start: undefined, end: undefined },
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { dateRange, ...filterSelection } = filterState
		persistFilterSelection(filterSelection)

		// Should remove storage when no active filters
		expect(localStorageMock.removeItem).toHaveBeenCalledWith(storageKey)

		const loaded = loadPersistedFilterSelection()
		expect(loaded).toBeUndefined()
	})

	it('should handle corrupted localStorage data', () => {
		localStorageMock.getItem.mockReturnValue('invalid json')

		const result = loadPersistedFilterSelection()
		expect(result).toBeUndefined()
	})

	it('should handle partial persisted data', () => {
		localStorageMock.getItem.mockReturnValue(
			JSON.stringify({
				payees: ['Test Payee'],
				// Missing other fields
			})
		)

		const result = loadPersistedFilterSelection()
		expect(result).toEqual({
			payees: ['Test Payee'],
			accounts: [],
			categories: [],
			categoryMode: 'include',
			transactionTypes: [],
			tags: [],
		})
	})
})
