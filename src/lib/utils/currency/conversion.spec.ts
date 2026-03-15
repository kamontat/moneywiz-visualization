import { describe, expect, it } from 'vitest'

import { normalizeCurrencyCode, toDateKey, toFiniteNumber } from './conversion'

describe('normalizeCurrencyCode', () => {
	it('returns BASE_CURRENCY for undefined', () => {
		expect(normalizeCurrencyCode(undefined)).toBe('THB')
	})

	it('returns BASE_CURRENCY for null', () => {
		expect(normalizeCurrencyCode(null)).toBe('THB')
	})

	it('returns BASE_CURRENCY for empty string', () => {
		expect(normalizeCurrencyCode('')).toBe('THB')
	})

	it('returns BASE_CURRENCY for whitespace-only string', () => {
		expect(normalizeCurrencyCode('   ')).toBe('THB')
	})

	it('uppercases currency code', () => {
		expect(normalizeCurrencyCode('usd')).toBe('USD')
	})

	it('trims whitespace', () => {
		expect(normalizeCurrencyCode('  eur  ')).toBe('EUR')
	})

	it('passes through already-normalized code', () => {
		expect(normalizeCurrencyCode('JPY')).toBe('JPY')
	})
})

describe('toDateKey', () => {
	it('formats date as YYYY-MM-DD', () => {
		expect(toDateKey(new Date('2026-01-15'))).toBe('2026-01-15')
	})

	it('zero-pads single-digit month and day', () => {
		expect(toDateKey(new Date('2026-03-05'))).toBe('2026-03-05')
	})
})

describe('toFiniteNumber', () => {
	it('returns number for finite number', () => {
		expect(toFiniteNumber(42)).toBe(42)
	})

	it('returns number for negative number', () => {
		expect(toFiniteNumber(-3.14)).toBe(-3.14)
	})

	it('returns undefined for NaN', () => {
		expect(toFiniteNumber(NaN)).toBeUndefined()
	})

	it('returns undefined for Infinity', () => {
		expect(toFiniteNumber(Infinity)).toBeUndefined()
	})

	it('parses numeric string', () => {
		expect(toFiniteNumber('35.5')).toBe(35.5)
	})

	it('returns undefined for non-numeric string', () => {
		expect(toFiniteNumber('abc')).toBeUndefined()
	})

	it('returns undefined for null', () => {
		expect(toFiniteNumber(null)).toBeUndefined()
	})

	it('returns undefined for undefined', () => {
		expect(toFiniteNumber(undefined)).toBeUndefined()
	})

	it('returns undefined for object', () => {
		expect(toFiniteNumber({})).toBeUndefined()
	})
})
