import type { RateProviderOptions } from '$lib/apis/bank/currency/types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'
import type { FxRateTable } from '$lib/currency/models/index.js'
import { createCurrencyConverter } from '$lib/apis/bank/currency/index.js'
import { resolveRateMatch } from '$lib/apis/bank/currency/rates.js'
import { BASE_CURRENCY, toDateKey } from '$lib/utils/currency/index.js'

export interface FxConversionEntry {
	readonly transactionId: number
	readonly originalAmount: number
	readonly originalCurrency: string
	readonly convertedAmount: number
	readonly method: 'base' | 'exact' | 'estimated' | 'unresolved'
}

export interface FxConversionBatch {
	readonly entries: readonly FxConversionEntry[]
	readonly unresolvedCount: number
}

export interface CurrencyController {
	readonly name: 'currency'
	fetchRates(transactions: readonly DataTransaction[]): Promise<FxRateTable>
	convert(
		transactions: readonly DataTransaction[],
		rateTable: FxRateTable
	): FxConversionBatch
}

export function createCurrencyController(
	options?: RateProviderOptions
): CurrencyController {
	const converter = createCurrencyConverter(options)

	const fetchRates = async (
		transactions: readonly DataTransaction[]
	): Promise<FxRateTable> => {
		return converter.fetchRates(transactions)
	}

	const convert = (
		transactions: readonly DataTransaction[],
		rateTable: FxRateTable
	): FxConversionBatch => {
		const entries: FxConversionEntry[] = []
		let unresolvedCount = 0

		for (const tx of transactions) {
			const currency = tx.currency.toUpperCase()

			if (currency === BASE_CURRENCY) {
				entries.push({
					transactionId: tx.id,
					originalAmount: tx.amount,
					originalCurrency: tx.currency,
					convertedAmount: tx.amount,
					method: 'base',
				})
				continue
			}

			const dateKey = toDateKey(tx.date)
			const rate = resolveRateMatch(rateTable, currency, dateKey)

			if (rate !== undefined) {
				entries.push({
					transactionId: tx.id,
					originalAmount: tx.amount,
					originalCurrency: tx.currency,
					convertedAmount: tx.amount * rate.rate,
					method: rate.exact ? 'exact' : 'estimated',
				})
			} else {
				entries.push({
					transactionId: tx.id,
					originalAmount: tx.amount,
					originalCurrency: tx.currency,
					convertedAmount: tx.amount,
					method: 'unresolved',
				})
				unresolvedCount++
			}
		}

		return { entries, unresolvedCount }
	}

	return { name: 'currency', fetchRates, convert }
}
