import type { ParsedAmount } from '$lib/transactions'

export const formatAmount = (amount: ParsedAmount): string => {
	return new Intl.NumberFormat(amount.locale ?? 'th-TH', {
		style: 'currency',
		currency: amount.currency,
		currencyDisplay: 'symbol',
		maximumFractionDigits: 2,
		...amount.format,
	}).format(amount.value)
}
