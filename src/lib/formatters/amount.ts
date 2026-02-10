import type { ParsedAmount } from '$lib/transactions/models'

export const formatAmount = (amount: ParsedAmount): string => {
	return new Intl.NumberFormat(amount.locale ?? 'th-TH', {
		style: 'currency',
		currency: amount.currency,
		currencyDisplay: 'symbol',
		maximumFractionDigits: 2,
		...amount.format,
	}).format(amount.value)
}

export const formatCurrency = (
	value: number,
	currency = 'THB',
	locale = 'th-TH',
	format?: Intl.NumberFormatOptions
): string => {
	return formatAmount({
		value,
		currency,
		locale,
		format,
	})
}
