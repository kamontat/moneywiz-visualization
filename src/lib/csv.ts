import { log } from './debug';
import type {
	AccountType,
	MoneyWizTransaction,
	ParsedAccount,
	ParsedCategory,
	ParsedTag,
} from './types';

export interface CsvRow {
	[key: string]: string;
}

export interface ParsedCsv {
	headers: string[];
	rows: CsvRow[];
}

/** Error thrown when CSV parsing fails */
export class CsvParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CsvParseError';
	}
}

/**
 * Parse a CSV file into headers and row objects. Basic quoting is supported (double quotes, escaped by doubling).
 * @throws {CsvParseError} When the file is empty or contains no valid data
 */
export async function parseCsvFile(file: File): Promise<ParsedCsv> {
	log.csv('parsing file: %s (%d bytes)', file.name, file.size);

	if (file.size === 0) {
		log.csv('error: file is empty');
		throw new CsvParseError('File is empty');
	}

	const content = await file.text();
	const result = parseCsv(content);
	log.csv('file parsed: %d headers, %d rows', result.headers.length, result.rows.length);
	return result;
}

/**
 * Parse a MoneyWiz CSV report file into structured transaction objects.
 */
export async function parseMoneyWizReport(file: File): Promise<MoneyWizTransaction[]> {
	const { rows } = await parseCsvFile(file);
	return rows.map(transformRow);
}

export function parseCsv(text: string): ParsedCsv {
	log.csv('parsing text: %d characters', text.length);
	const cleaned = text.replace(/^\uFEFF/, '');
	const rawLines = cleaned.split(/\r?\n/).map((line) => line.trimEnd());
	log.csv('split into %d raw lines', rawLines.length);

	let startIndex = 0;
	let delimiter = ',';

	// Skip leading empty lines
	while (startIndex < rawLines.length && rawLines[startIndex].trim() === '') {
		startIndex += 1;
	}

	// MoneyWiz exports include a "sep=," (or similar) preamble; detect and honor it
	const firstLine = rawLines[startIndex]?.trim();
	if (firstLine?.toLowerCase().startsWith('sep=')) {
		delimiter = firstLine.slice(4, 5) || delimiter;
		log.csv('detected separator preamble: delimiter=%s', delimiter);
		startIndex += 1;
	}

	const lines = rawLines.slice(startIndex).filter((line) => line.trim().length > 0);
	log.csv('filtered to %d non-empty lines (starting at index %d)', lines.length, startIndex);

	if (lines.length === 0) {
		log.csv('error: no data lines found');
		throw new CsvParseError('CSV contains no data');
	}

	const headers = tokenize(lines[0], delimiter).map(
		(header, index) => header || `field${index + 1}`
	);

	if (headers.length === 0) {
		log.csv('error: no headers found');
		throw new CsvParseError('CSV contains no headers');
	}

	const rows = lines.slice(1).map((line) => {
		const cells = tokenize(line, delimiter);
		const entry: CsvRow = {};

		headers.forEach((header, index) => {
			entry[header] = cells[index] ?? '';
		});

		return entry;
	});

	log.csv('parsed: %d headers, %d rows', headers.length, rows.length);
	return { headers, rows };
}

function tokenize(line: string, delimiter = ','): string[] {
	const values: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		const next = line[index + 1];

		if (character === '"') {
			if (inQuotes && next === '"') {
				current += '"';
				index += 1;
				continue;
			}

			inQuotes = !inQuotes;
			continue;
		}

		if (character === delimiter && !inQuotes) {
			values.push(current.trim());
			current = '';
			continue;
		}

		current += character;
	}

	values.push(current.trim());
	return values;
}

// --- Field Parsers ---

export function parseCategory(raw: string): ParsedCategory | null {
	if (!raw) return null;
	const parts = raw.split('>').map((s) => s.trim());
	return {
		root: parts[0] || '',
		sub: parts[1] || '',
	};
}

export function parseTags(raw: string): ParsedTag[] {
	if (!raw) return [];
	return raw
		.split(';')
		.map((t) => t.trim())
		.filter((t) => t.length > 0)
		.map((t) => {
			const parts = t.split(':');
			if (parts.length > 1) {
				return { group: parts[0].trim(), name: parts[1].trim() };
			}
			return { group: '', name: parts[0].trim() };
		});
}

export function parseDate(dateStr: string, timeStr: string): Date {
	const [day, month, year] = (dateStr || '').split('/').map(Number);
	const [hour, minute] = (timeStr || '00:00').split(':').map(Number);
	// Month is 0-indexed in JS Date
	if (!day || !month || !year) return new Date(NaN);
	return new Date(year, month - 1, day, hour || 0, minute || 0);
}

export function parseAccount(raw: string): ParsedAccount {
	if (!raw) return { name: '', extra: '', type: 'Unknown' };

	const match = raw.match(/^(.*)\s\((.*)\)$/);
	if (match) {
		const nameAndExtra = match[1].trim();
		const typeStr = match[2];

		const validTypes: AccountType[] = ['A', 'C', 'D', 'L', 'I', 'CT'];

		return {
			name: nameAndExtra,
			extra: '',
			type: validTypes.includes(typeStr as AccountType) ? (typeStr as AccountType) : 'Unknown',
		};
	}

	return { name: raw, extra: '', type: 'Unknown' };
}

export function parseAmount(raw: string): number {
	if (!raw) return 0;
	// Remove commas and parse
	return parseFloat(raw.replace(/,/g, ''));
}

export function transformRow(row: CsvRow): MoneyWizTransaction {
	return {
		account: parseAccount(row['Account']),
		transfers: row['Transfers'] ? parseAccount(row['Transfers']) : null,
		description: row['Description'] || '',
		payee: row['Payee'] || '',
		category: parseCategory(row['Category']),
		date: parseDate(row['Date'], row['Time']),
		memo: row['Memo'] || '',
		amount: parseAmount(row['Amount']),
		currency: row['Currency'] || '',
		checkNumber: row['Check #'] || '',
		tags: parseTags(row['Tags']),
		// @ts-expect-error - CsvRow is compatible with Record<string, string> but TS might complain
		raw: row,
	};
}
