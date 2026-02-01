export interface ParsedCsvRow {
	[key: string]: string
}

export interface ParsedCsv {
	fileName: string | null
	headers: string[]
	rows: ParsedCsvRow[]
}
