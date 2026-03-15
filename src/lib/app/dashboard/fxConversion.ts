import type { FxConversionBatch } from '$lib/app/controllers/currencyController'
import type {
	FxConversionResult,
	FxConversionSummary,
	FxUnresolvedItem,
} from '$lib/currency/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { BASE_CURRENCY, toDateKey } from '$lib/utils/currency'

const cloneAsTHB = (
	transaction: ParsedTransaction,
	value: number
): ParsedTransaction => {
	return {
		...transaction,
		amount: {
			...transaction.amount,
			value,
			currency: BASE_CURRENCY,
		},
	}
}

const toUnresolvedByCurrency = (
	items: readonly FxUnresolvedItem[]
): Record<string, number> => {
	const counts: Record<string, number> = {}

	for (const item of items) {
		counts[item.currency] = (counts[item.currency] ?? 0) + 1
	}

	return counts
}

export function toLegacyFxConversionResult(
	batch: FxConversionBatch,
	parsedById: ReadonlyMap<number, ParsedTransaction>
): FxConversionResult {
	const transactions: ParsedTransaction[] = []
	const unresolved: FxUnresolvedItem[] = []
	let exactCount = 0
	let estimatedCount = 0

	for (const entry of batch.entries) {
		const parsed = parsedById.get(entry.transactionId)

		if (entry.method === 'exact') {
			exactCount += 1
		}

		if (entry.method === 'estimated') {
			estimatedCount += 1
		}

		if (entry.method === 'unresolved') {
			unresolved.push({
				transactionId: entry.transactionId,
				currency: entry.originalCurrency.toUpperCase(),
				date: parsed ? toDateKey(parsed.date) : '',
			})
			continue
		}

		if (!parsed) continue

		transactions.push(cloneAsTHB(parsed, entry.convertedAmount))
	}

	const summary: FxConversionSummary = {
		total: batch.entries.length,
		convertedCount: transactions.length,
		exactCount,
		estimatedCount,
		unresolvedCount: unresolved.length,
		unresolvedByCurrency: toUnresolvedByCurrency(unresolved),
	}

	return {
		transactions,
		unresolved,
		summary,
	}
}
