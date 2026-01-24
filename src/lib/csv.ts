export interface CsvRow {
	[key: string]: string;
}

export interface ParsedCsv {
	headers: string[];
	rows: CsvRow[];
}

/**
 * Parse a CSV file into headers and row objects. Basic quoting is supported (double quotes, escaped by doubling).
 */
export async function parseCsvFile(file: File): Promise<ParsedCsv> {
	const content = await file.text();
	return parseCsv(content);
}

export function parseCsv(text: string): ParsedCsv {
	const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

	if (lines.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = tokenize(lines[0]).map((header, index) => header || `field${index + 1}`);
	const rows = lines.slice(1).map((line) => {
		const cells = tokenize(line);
		const entry: CsvRow = {};

		headers.forEach((header, index) => {
			entry[header] = cells[index] ?? '';
		});

		return entry;
	});

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
