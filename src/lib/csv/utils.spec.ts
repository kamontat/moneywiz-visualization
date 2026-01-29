import { describe, it, expect } from 'vitest'
import { tokenize } from './utils'

describe('tokenize', () => {
	it('should split string by comma delimiter by default', () => {
		const line = 'a,b,c'
		const result = tokenize(line)
		expect(result).toEqual(['a', 'b', 'c'])
	})

	it('should handle empty values', () => {
		const line = 'a,,c'
		const result = tokenize(line)
		expect(result).toEqual(['a', '', 'c'])
	})

	it('should trim whitespace around values', () => {
		const line = ' a , b , c '
		const result = tokenize(line)
		expect(result).toEqual(['a', 'b', 'c'])
	})

	it('should support custom delimiter', () => {
		const line = 'a;b;c'
		const result = tokenize(line, ';')
		expect(result).toEqual(['a', 'b', 'c'])
	})

	it('should handle quoted values containing delimiter', () => {
		const line = 'a,"b,c",d'
		const result = tokenize(line)
		expect(result).toEqual(['a', 'b,c', 'd'])
	})

	it('should handle quoted values containing custom delimiter', () => {
		const line = 'a;"b;c";d'
		const result = tokenize(line, ';')
		expect(result).toEqual(['a', 'b;c', 'd'])
	})

	it('should handle quoted values containing quotes (escaped by double quote)', () => {
		const line = 'a,"b""c",d'
		const result = tokenize(line)
		expect(result).toEqual(['a', 'b"c', 'd'])
	})

	it('should handle quoted values with whitespace outside quotes', () => {
		const line = 'a, "b" ,c'
		const result = tokenize(line)
		expect(result).toEqual(['a', 'b', 'c'])
	})

	it('should handle quoted values with whitespace inside quotes', () => {
		const line = 'a," b ",      c'
		const result = tokenize(line)
		expect(result).toEqual(['a', ' b ', 'c'])
	})
})
