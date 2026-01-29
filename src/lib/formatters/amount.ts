import type { ParsedAmount } from '$lib/transactions'
import { DEFAULT_LOCALE } from './constants'

export const formatAmount = (amount: ParsedAmount): string => {
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency: amount.currency,
		currencyDisplay: 'symbol',
		maximumFractionDigits: 2,
		...amount.format,
	}).format(amount.value)
}
