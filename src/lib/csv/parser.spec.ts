import { describe, it, expect } from 'vitest'

import { CsvParseError } from './errors'
import { parseCsv, parseCsvFile } from './parser'

describe('parseCsv', () => {
	it('should parse simple csv string', () => {
		const text = `col1,col2
val1,val2`
		const result = parseCsv(text)

		expect(result.headers).toEqual(['col1', 'col2'])
		expect(result.rows).toHaveLength(1)
		expect(result.rows[0]).toEqual({
			col1: 'val1',
			col2: 'val2',
		})
	})

	it('should skip leading empty lines', () => {
		const text = `

col1,col2
val1,val2`
		const result = parseCsv(text)
		expect(result.headers).toEqual(['col1', 'col2'])
	})

	it('should handle BOM character', () => {
		const text = `\uFEFFcol1,col2
val1,val2`
		const result = parseCsv(text)
		expect(result.headers).toEqual(['col1', 'col2'])
	})

	it('should handle sep= header for custom delimiter', () => {
		const text = `sep=;
col1;col2
val1;val2`
		const result = parseCsv(text)
		expect(result.headers).toEqual(['col1', 'col2'])
		expect(result.rows[0]).toEqual({
			col1: 'val1',
			col2: 'val2',
		})
	})

	it('should throw error if input is empty (after stripping empty lines)', () => {
		expect(() => parseCsv('')).toThrow(CsvParseError)
		expect(() => parseCsv('   \n  ')).toThrow(CsvParseError)
	})

	it('should handle missing values in rows', () => {
		// Code logic: cells[index] ?? ''
		const text = `col1,col2
val1`
		const result = parseCsv(text)
		expect(result.rows[0]).toEqual({
			col1: 'val1',
			col2: '',
		})
	})

	it('should handle extra values in rows', () => {
		// Code logic: headers.forEach(...) so extra cells are ignored
		const text = `col1,col2
val1,val2,val3`
		const result = parseCsv(text)
		expect(result.rows[0]).toEqual({
			col1: 'val1',
			col2: 'val2',
		})
		expect(Object.keys(result.rows[0])).toEqual(['col1', 'col2'])
	})

	it('should use default delimiter if sep= is empty', () => {
		const text = `sep=
col1,col2
val1,val2`
		const result = parseCsv(text)
		expect(result.headers).toEqual(['col1', 'col2'])
	})

	it('should generate default field names for empty headers', () => {
		const text = `col1,,col3
val1,val2,val3`
		const result = parseCsv(text)
		expect(result.headers).toEqual(['col1', 'field-2', 'col3'])
		expect(result.rows[0]).toEqual({
			col1: 'val1',
			'field-2': 'val2',
			col3: 'val3',
		})
	})
})

describe('parseCsvFile', () => {
	it('should parse file mock', async () => {
		const content = `col1,col2
val1,val2`
		const file = {
			name: 'test.csv',
			size: content.length,
			text: async () => content,
		} as unknown as File

		const result = await parseCsvFile(file)
		expect(result.headers).toEqual(['col1', 'col2'])
		expect(result.rows).toHaveLength(1)
	})

	it('should throw if file is empty', async () => {
		const file = {
			name: 'empty.csv',
			size: 0,
			text: async () => '',
		} as unknown as File

		await expect(parseCsvFile(file)).rejects.toThrow(/File is empty/)
	})
})
