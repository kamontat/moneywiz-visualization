import { describe, it, expect } from 'vitest'

import { formatDate } from './date'

describe('date', () => {
	it('should format date in en-GB locale (DD MMM YYYY)', () => {
		const date = new Date(2023, 0, 15, 12, 0, 0)

		const result = formatDate(date)
		expect(result).toBe('15 Jan 2023')
	})
})
