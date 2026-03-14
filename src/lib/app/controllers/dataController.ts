import type { DataAccount } from '$lib/apis/record/accounts/types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'
import type { RecordApiV1 } from '$lib/apis/record/v1.js'
import type {
	FilterState,
	FilterOptions,
	Analytics,
} from '$lib/app/sessions/types.js'
import {
	byDateRange,
	byTransactionType,
	byCategory,
	byPayee,
	byAccount,
	byTags,
} from '$lib/apis/pipelines/filters/index.js'
import {
	calculateNetIncome,
	type NetIncome,
} from '$lib/apis/pipelines/reduces/calculateNetIncome.js'
import { calculateSavingsRate } from '$lib/apis/pipelines/reduces/calculateSavingsRate.js'

export interface DataController {
	readonly name: 'data'
	loadAll(): Promise<void>
	getTransactions(filters: FilterState): DataTransaction[]
	getAnalytics(filters: FilterState): Analytics
	getAvailableOptions(filters: FilterState): FilterOptions
	getAllAccounts(): readonly DataAccount[]
	getAllTransactions(): readonly DataTransaction[]
}

export function createDataController(recordApi: RecordApiV1): DataController {
	let cachedTransactions: readonly DataTransaction[] = []
	let cachedAccounts: readonly DataAccount[] = []

	const loadAll = async (): Promise<void> => {
		const [txResult, accResult] = await Promise.all([
			recordApi.getTransactions(),
			recordApi.getAccounts(),
		])
		cachedTransactions = txResult.transactions
		cachedAccounts = accResult.accounts
	}

	const applyFilters = (filters: FilterState): DataTransaction[] => {
		let result: DataTransaction[] = [...cachedTransactions]

		if (filters.dateRange) {
			result = byDateRange(
				filters.dateRange.start,
				filters.dateRange.end
			)(result)
		}
		if (filters.transactionTypes.length > 0) {
			result = byTransactionType(
				filters.transactionTypes,
				filters.transactionTypeMode
			)(result)
		}
		if (filters.categories.length > 0) {
			result = byCategory(filters.categories, filters.categoryMode)(result)
		}
		if (filters.payees.length > 0) {
			result = byPayee(filters.payees)(result)
		}
		if (filters.accounts.length > 0) {
			result = byAccount(filters.accounts)(result)
		}
		if (filters.tags.length > 0) {
			result = byTags(filters.tags)(result)
		}

		return result
	}

	const getTransactions = (filters: FilterState): DataTransaction[] => {
		return applyFilters(filters)
	}

	const getAnalytics = (filters: FilterState): Analytics => {
		const filtered = applyFilters(filters)

		const emptyNet: NetIncome = { income: 0, expense: 0, net: 0 }
		const netIncome = calculateNetIncome()(emptyNet, filtered)
		const savingsRate = calculateSavingsRate()(
			{ income: 0, expense: 0, rate: 0 },
			filtered
		)

		return {
			income: netIncome.income,
			expense: netIncome.expense,
			net: netIncome.net,
			savingsRate: savingsRate.rate,
			transactionCount: filtered.length,
		}
	}

	const getAvailableOptions = (filters: FilterState): FilterOptions => {
		const filtered = applyFilters(filters)

		const categories = [...new Set(filtered.map((tx) => tx.category))].sort()
		const payees = [
			...new Set(filtered.map((tx) => tx.payee).filter(Boolean)),
		].sort()
		const accountIds = [...new Set(filtered.map((tx) => tx.accountId))]
		const accounts = cachedAccounts
			.filter((a) => accountIds.includes(a.id))
			.map((a) => ({ id: a.id, name: a.name }))
		const transactionTypes = [...new Set(filtered.map((tx) => tx.type))].sort()
		const tags = [
			...new Set(
				filtered.flatMap((tx) => tx.tags.map((t) => `${t.category}:${t.name}`))
			),
		].sort()

		const dates = filtered.map((tx) => tx.date.getTime())
		const dateRange =
			dates.length > 0
				? {
						start: new Date(Math.min(...dates)),
						end: new Date(Math.max(...dates)),
					}
				: undefined

		return {
			categories,
			payees,
			accounts,
			transactionTypes,
			tags,
			dateRange,
		}
	}

	return {
		name: 'data',
		loadAll,
		getTransactions,
		getAnalytics,
		getAvailableOptions,
		getAllAccounts: () => cachedAccounts,
		getAllTransactions: () => cachedTransactions,
	}
}
