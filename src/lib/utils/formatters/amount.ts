export const formatAmount = (
	value: number,
	currency = 'THB',
	locale = 'th-TH',
	options?: Intl.NumberFormatOptions
): string => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		currencyDisplay: 'symbol',
		maximumFractionDigits: 2,
		...options,
	}).format(value)
}
