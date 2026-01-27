import { describe, expect, it } from 'vitest';
import { parseCsv, CsvParseError } from './csv';

describe('parseCsv', () => {
	it('skips sep preamble and respects declared delimiter', () => {
		const sample = 'sep=,\n"Account","Amount"\n"Wallet",10.5\n';
		const result = parseCsv(sample);

		expect(result.headers).toEqual(['Account', 'Amount']);
		expect(result.rows).toEqual([{ Account: 'Wallet', Amount: '10.5' }]);
	});

	it('throws CsvParseError for empty input', () => {
		expect(() => parseCsv('')).toThrow(CsvParseError);
		expect(() => parseCsv('')).toThrow('CSV contains no data');
	});

	it('throws CsvParseError for whitespace-only input', () => {
		expect(() => parseCsv('   \n\n  ')).toThrow(CsvParseError);
		expect(() => parseCsv('   \n\n  ')).toThrow('CSV contains no data');
	});

	it('parses headers-only CSV without rows', () => {
		const sample = 'Name,Age,City\n';
		const result = parseCsv(sample);

		expect(result.headers).toEqual(['Name', 'Age', 'City']);
		expect(result.rows).toEqual([]);
	});
});
