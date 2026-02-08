import { describe, it, expect } from 'vitest'

import {
	getCategoryFullName,
	isDebtCategory,
	isDebtRepaymentCategory,
	isGiftCategory,
	isGiveawayCategory,
	isIncomeCategory,
	isSpecialCategory,
	isWindfallCategory,
	parseAccount,
	parseAmount,
	parseCategory,
	parseDate,
	parseTag,
} from './utils'

describe('parseAccount', () => {
	it('should parse account with type code', () => {
		const result = parseAccount('Kbank primary (A)')
		expect(result.name).toBe('Kbank primary')
		expect(result.type).toBe('Checking')
		expect(result.extra).toBeNull()
	})

	it('should parse credit card type', () => {
		const result = parseAccount('TMRW Master (C)')
		expect(result.name).toBe('TMRW Master')
		expect(result.type).toBe('CreditCard')
	})

	it('should parse account with extra info', () => {
		const result = parseAccount('Chase [1234] (C)')
		expect(result.name).toBe('Chase')
		expect(result.extra).toBe('1234')
		expect(result.type).toBe('CreditCard')
	})

	it('should return Unknown for unrecognized type', () => {
		const result = parseAccount('Some Account (X)')
		expect(result.type).toBe('Unknown')
	})
})

describe('parseAmount', () => {
	it('should parse positive amount with commas', () => {
		const result = parseAmount('172,522.92', 'THB')
		expect(result.value).toBe(172522.92)
		expect(result.currency).toBe('THB')
	})

	it('should parse negative amount', () => {
		const result = parseAmount('-134.00', 'THB')
		expect(result.value).toBe(-134)
		expect(result.currency).toBe('THB')
	})

	it('should parse large amount with multiple commas', () => {
		const result = parseAmount('1,234,567.89', 'USD')
		expect(result.value).toBe(1234567.89)
	})

	it('should use default currency if not provided', () => {
		const result = parseAmount('100', null)
		expect(result.currency).toBe('THB')
	})
})

describe('parseCategory', () => {
	it('should parse parent > child category', () => {
		const result = parseCategory('Compensation > Salary')
		expect(result.category).toBe('Compensation')
		expect(result.subcategory).toBe('Salary')
	})

	it('should parse category with spaces around >', () => {
		const result = parseCategory('Food and Beverage > Food')
		expect(result.category).toBe('Food and Beverage')
		expect(result.subcategory).toBe('Food')
	})

	it('should handle category without subcategory', () => {
		const result = parseCategory('Utilities')
		expect(result.category).toBe('Utilities')
		expect(result.subcategory).toBe('')
	})
})

describe('parseTag', () => {
	it('should parse single tag with category', () => {
		const result = parseTag('Group: KcNt')
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({ category: 'Group', name: 'KcNt' })
	})

	it('should parse multiple tags separated by semicolon', () => {
		const result = parseTag('Group: KcNt; Event: Birthday')
		expect(result).toHaveLength(2)
		expect(result[0]).toEqual({ category: 'Group', name: 'KcNt' })
		expect(result[1]).toEqual({ category: 'Event', name: 'Birthday' })
	})

	it('should handle trailing semicolon', () => {
		const result = parseTag('Group: KcNt; ')
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({ category: 'Group', name: 'KcNt' })
	})

	it('should return empty array for empty string', () => {
		const result = parseTag('')
		expect(result).toEqual([])
	})

	it('should map Zvent to Event', () => {
		const result = parseTag('Zvent: Concert')
		expect(result[0]).toEqual({ category: 'Event', name: 'Concert' })
	})
})

describe('parseDate', () => {
	it('should parse DD/MM/YYYY date format', () => {
		const result = parseDate('22/01/2026', '02:25')
		expect(result.getFullYear()).toBe(2026)
		expect(result.getMonth()).toBe(0)
		expect(result.getDate()).toBe(22)
		expect(result.getHours()).toBe(2)
		expect(result.getMinutes()).toBe(25)
	})

	it('should handle date without time', () => {
		const result = parseDate('15/06/2025', null)
		expect(result.getFullYear()).toBe(2025)
		expect(result.getMonth()).toBe(5)
		expect(result.getDate()).toBe(15)
		expect(result.getHours()).toBe(0)
		expect(result.getMinutes()).toBe(0)
	})

	it('should return epoch date for empty input', () => {
		const result = parseDate('', '')
		expect(result.getTime()).toBe(0)
	})
})

describe('isIncomeCategory', () => {
	it('should return true for Compensation category', () => {
		expect(
			isIncomeCategory({ category: 'Compensation', subcategory: 'Salary' })
		).toBe(true)
	})

	it('should return true for Compensation with any subcategory', () => {
		expect(
			isIncomeCategory({ category: 'Compensation', subcategory: 'Dividend' })
		).toBe(true)
		expect(
			isIncomeCategory({ category: 'Compensation', subcategory: 'Rent' })
		).toBe(true)
		expect(
			isIncomeCategory({ category: 'Compensation', subcategory: '' })
		).toBe(true)
	})

	it('should return true for Other Incomes category', () => {
		expect(
			isIncomeCategory({ category: 'Other Incomes', subcategory: 'Gift' })
		).toBe(true)
		expect(
			isIncomeCategory({ category: 'Other Incomes', subcategory: '' })
		).toBe(true)
	})

	it('should return false for non-income category', () => {
		expect(
			isIncomeCategory({ category: 'Food', subcategory: 'Restaurant' })
		).toBe(false)
	})

	it('should return false for Financial category (not an income prefix)', () => {
		expect(
			isIncomeCategory({ category: 'Financial', subcategory: 'Cashback' })
		).toBe(false)
		expect(
			isIncomeCategory({ category: 'Financial', subcategory: 'Interest' })
		).toBe(false)
	})

	it('should return false for Payment category', () => {
		expect(
			isIncomeCategory({ category: 'Payment', subcategory: 'Windfall' })
		).toBe(false)
	})
})

describe('getCategoryFullName', () => {
	it('should return full name with subcategory', () => {
		expect(
			getCategoryFullName({ category: 'Payment', subcategory: 'Debt' })
		).toBe('Payment > Debt')
	})

	it('should return just category when no subcategory', () => {
		expect(
			getCategoryFullName({ category: 'Utilities', subcategory: '' })
		).toBe('Utilities')
	})
})

describe('isSpecialCategory', () => {
	it('should return true for Payment > Debt', () => {
		expect(
			isSpecialCategory({ category: 'Payment', subcategory: 'Debt' })
		).toBe(true)
	})

	it('should return true for Payment > Debt Repayment', () => {
		expect(
			isSpecialCategory({ category: 'Payment', subcategory: 'Debt Repayment' })
		).toBe(true)
	})

	it('should return true for Payment > Giveaways', () => {
		expect(
			isSpecialCategory({ category: 'Payment', subcategory: 'Giveaways' })
		).toBe(true)
	})

	it('should return true for Payment > Windfall', () => {
		expect(
			isSpecialCategory({ category: 'Payment', subcategory: 'Windfall' })
		).toBe(true)
	})

	it('should return false for regular category', () => {
		expect(
			isSpecialCategory({ category: 'Food', subcategory: 'Restaurant' })
		).toBe(false)
	})
})

describe('isDebtCategory', () => {
	it('should return true for Payment > Debt', () => {
		expect(isDebtCategory({ category: 'Payment', subcategory: 'Debt' })).toBe(
			true
		)
	})

	it('should return false for Payment > Debt Repayment', () => {
		expect(
			isDebtCategory({ category: 'Payment', subcategory: 'Debt Repayment' })
		).toBe(false)
	})

	it('should return false for gift categories', () => {
		expect(
			isDebtCategory({ category: 'Payment', subcategory: 'Giveaways' })
		).toBe(false)
	})
})

describe('isDebtRepaymentCategory', () => {
	it('should return true for Payment > Debt Repayment', () => {
		expect(
			isDebtRepaymentCategory({
				category: 'Payment',
				subcategory: 'Debt Repayment',
			})
		).toBe(true)
	})

	it('should return false for Payment > Debt', () => {
		expect(
			isDebtRepaymentCategory({ category: 'Payment', subcategory: 'Debt' })
		).toBe(false)
	})
})

describe('isWindfallCategory', () => {
	it('should return true for Payment > Windfall', () => {
		expect(
			isWindfallCategory({ category: 'Payment', subcategory: 'Windfall' })
		).toBe(true)
	})

	it('should return false for other categories', () => {
		expect(
			isWindfallCategory({ category: 'Payment', subcategory: 'Giveaways' })
		).toBe(false)
	})
})

describe('isGiveawayCategory', () => {
	it('should return true for Payment > Giveaways', () => {
		expect(
			isGiveawayCategory({ category: 'Payment', subcategory: 'Giveaways' })
		).toBe(true)
	})

	it('should return false for other categories', () => {
		expect(
			isGiveawayCategory({ category: 'Payment', subcategory: 'Windfall' })
		).toBe(false)
	})
})

describe('isGiftCategory', () => {
	it('should return true for Payment > Giveaways', () => {
		expect(
			isGiftCategory({ category: 'Payment', subcategory: 'Giveaways' })
		).toBe(true)
	})

	it('should return true for Payment > Windfall', () => {
		expect(
			isGiftCategory({ category: 'Payment', subcategory: 'Windfall' })
		).toBe(true)
	})

	it('should return false for debt categories', () => {
		expect(isGiftCategory({ category: 'Payment', subcategory: 'Debt' })).toBe(
			false
		)
	})
})
