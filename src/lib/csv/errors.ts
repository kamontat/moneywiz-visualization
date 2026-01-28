/** Error thrown when CSV parsing fails */
export class CsvParseError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CsvParseError'
	}
}
