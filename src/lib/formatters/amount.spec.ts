import { describe, it, expect } from 'vitest'
import { formatAmount } from './amount'

describe('amount', () => {
	it('should format THB correctly', () => {
		const result = formatAmount({
			value: 1000,
			currency: 'THB',
		})
		// Allow for non-breaking space or standard space
		expect(result).toMatch(/฿1,000\.00/)
	})

	it('should format USD correctly (negative)', () => {
		const result = formatAmount({
			value: -500.5,
			currency: 'USD',
		})
		expect(result).toMatch(/-US\$500\.50/)
	})

	it('should use custom format options', () => {
		const result = formatAmount({
			value: 1234.5678,
			currency: 'THB',
			format: { maximumFractionDigits: 3 },
		})
		expect(result).toMatch(/฿1,234\.568/)
	})

    it('should handle zero', () => {
        const result = formatAmount({
            value: 0,
            currency: 'THB'
        })
        expect(result).toMatch(/฿0\.00/)
    })
})
