export interface ParsedAmount {
	value: number
	currency: string
	locale?: string
	format?: Intl.NumberFormatOptions
}
