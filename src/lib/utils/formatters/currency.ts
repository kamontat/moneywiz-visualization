export const formatCurrencyCode = (code: string): string => {
	return code.trim().toUpperCase()
}

export const formatCurrencyAmount = (
	value: number,
	currency = 'THB',
	locale = 'th-TH'
): string => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		currencyDisplay: 'narrowSymbol',
		maximumFractionDigits: 2,
	}).format(value)
}
