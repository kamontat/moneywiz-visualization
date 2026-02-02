import { describe, it, expect } from 'vitest'

import { formatCategory } from './category'

describe('category', () => {
	it('should format category without subcategory', () => {
		expect(formatCategory({ category: 'Food', subcategory: '' })).toBe('Food')
	})

	it('should format category with subcategory', () => {
		expect(formatCategory({ category: 'Food', subcategory: 'Groceries' })).toBe(
			'Food > Groceries'
		)
	})

	it('should format category with null subcategory (if type allows, though type says string)', () => {
		// Based on interface, subcategory is string.
		// But let's follow the code: `${cat.category}${cat.subcategory ? ` > ${cat.subcategory}` : ''}`
		// If subcategory is empty string, it works.
		expect(formatCategory({ category: 'Test', subcategory: '' })).toBe('Test')
	})
})
