export interface ParsedCsvRow {
	[key: string]: string
}

export interface ParsedCsv {
	headers: string[]
	rows: ParsedCsvRow[]
}
