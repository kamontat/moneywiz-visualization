import { describe, it, expect } from 'vitest';
import { parseCategory, parseTags, parseDate, parseAccount, transformRow } from './csv';

describe('Field Parsers', () => {
	describe('parseCategory', () => {
		it('parses category and subcategory', () => {
			expect(parseCategory('Food > Restaurant')).toEqual({ root: 'Food', sub: 'Restaurant' });
		});
		it('parses root only', () => {
			expect(parseCategory('Income')).toEqual({ root: 'Income', sub: '' });
		});
		it('handles spaces', () => {
			expect(parseCategory(' Food  >  Fast Food ')).toEqual({ root: 'Food', sub: 'Fast Food' });
		});
		it('returns null for empty input', () => {
			expect(parseCategory('')).toBeNull();
		});
	});

	describe('parseTags', () => {
		it('parses group and name', () => {
			expect(parseTags('Group: TagName')).toEqual([{ group: 'Group', name: 'TagName' }]);
		});
		it('parses multiple tags', () => {
			expect(parseTags('G1: T1; G2: T2')).toEqual([
				{ group: 'G1', name: 'T1' },
				{ group: 'G2', name: 'T2' },
			]);
		});
		it('parses tag without group', () => {
			expect(parseTags('TagName')).toEqual([{ group: '', name: 'TagName' }]);
		});
		it('handles semicolon at end', () => {
			expect(parseTags('Group: Name; ')).toEqual([{ group: 'Group', name: 'Name' }]);
		});
		it('returns empty array for empty input', () => {
			expect(parseTags('')).toEqual([]);
		});
	});

	describe('parseDate', () => {
		it('parses DD/MM/YYYY and HH:MM', () => {
			const date = parseDate('23/01/2026', '21:18');
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(0); // January
			expect(date.getDate()).toBe(23);
			expect(date.getHours()).toBe(21);
			expect(date.getMinutes()).toBe(18);
		});
		it('handle empty time', () => {
			const date = parseDate('23/01/2026', '');
			expect(date.getHours()).toBe(0);
			expect(date.getMinutes()).toBe(0);
		});
	});

	describe('parseAccount', () => {
		it('parses name and type', () => {
			expect(parseAccount('Wallet (A)')).toEqual({ name: 'Wallet', extra: '', type: 'A' });
		});
		it('parses complex name', () => {
			expect(parseAccount('My Bank Account (C)')).toEqual({
				name: 'My Bank Account',
				extra: '',
				type: 'C',
			});
		});
		it('parses unknown type as Unknown if not in list', () => {
			// If regex matches but type is not in list
			expect(parseAccount('Wallet (X)')).toEqual({ name: 'Wallet', extra: '', type: 'Unknown' });
		});
		it('parses raw string if pattern does not match', () => {
			expect(parseAccount('Just Wallet')).toEqual({
				name: 'Just Wallet',
				extra: '',
				type: 'Unknown',
			});
		});
	});

	describe('transformRow', () => {
		it('transforms raw csv row to MoneyWizTransaction', () => {
			const row = {
				Account: 'My Acc (A)',
				Transfers: '',
				Description: 'Desc',
				Payee: 'Payee',
				Category: 'Cat > Sub',
				Date: '23/01/2026',
				Time: '12:00',
				Memo: 'Memo',
				Amount: '1,234.56',
				Currency: 'THB',
				'Check #': '',
				Tags: 'G: T;',
			};

			const txn = transformRow(row);
			expect(txn.account).toEqual({ name: 'My Acc', extra: '', type: 'A' });
			expect(txn.category).toEqual({ root: 'Cat', sub: 'Sub' });
			expect(txn.amount).toBe(1234.56);
			expect(txn.transfers).toBeNull();
		});
	});
});
