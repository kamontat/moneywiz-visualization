export interface CsvRow {
	[key: string]: string
}

export interface ParsedCsv {
	headers: string[]
	rows: CsvRow[]
}

/** Error thrown when CSV parsing fails */
export class CsvParseError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CsvParseError'
	}
}
