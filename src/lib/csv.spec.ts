import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
	it('skips sep preamble and respects declared delimiter', () => {
		const sample = 'sep=,\n"Account","Amount"\n"Wallet",10.5\n';
		const result = parseCsv(sample);

		expect(result.headers).toEqual(['Account', 'Amount']);
		expect(result.rows).toEqual([
			{ Account: 'Wallet', Amount: '10.5' }
		]);
	});

	it('returns empty result for empty input', () => {
		const result = parseCsv('');
		expect(result).toEqual({ headers: [], rows: [] });
	});
});
