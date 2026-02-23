import type { NetWorthSummary, TransformByFunc, WaterfallStep } from './models'
import type {
	LedgerAccountBalanceRow,
	ParsedTransaction,
	ParsedTransactionType,
} from '$lib/transactions/models'
import { toNetWorthSummary } from './byNetWorth'

import { formatDate } from '$lib/formatters/date'

interface NetWorthBalanceOptions {
	accountBalances: LedgerAccountBalanceRow[]
	selectedAccounts?: string[]
}

const LOAN_ENTITY_ID = 14

type MonthlyBucket = Omit<WaterfallStep, 'label'>

const toMonthlyNet = (
	bucket: MonthlyBucket,
	type: ParsedTransactionType,
	amount: number
): void => {
	switch (type) {
		case 'Income':
		case 'Windfall':
			bucket.income += amount
			break
		case 'Expense':
		case 'Giveaway':
			bucket.expense += Math.abs(amount)
			break
		case 'Refund':
			bucket.expense -= amount
			break
		case 'Debt':
			bucket.debt += Math.abs(amount)
			break
		case 'DebtRepayment':
			bucket.income += Math.abs(amount)
			break
		case 'Buy':
			bucket.buySell -= Math.abs(amount)
			break
		case 'Sell':
			bucket.buySell += amount
			break
	}
}

export const byNetWorthFromBalances: TransformByFunc<
	[NetWorthBalanceOptions],
	NetWorthSummary
> = (options) => {
	const by = (transactions: ParsedTransaction[]) => {
		const selected = new Set(options.selectedAccounts ?? [])
		const hasSelectedAccounts = selected.size > 0
		const currentNetWorth = options.accountBalances
			.filter((account) => !account.isArchived)
			.filter((account) => account.entityId !== LOAN_ENTITY_ID)
			.filter((account) =>
				hasSelectedAccounts ? selected.has(account.name) : true
			)
			.reduce((sum, account) => sum + account.openingBalance, 0)

		const monthly = new Map<string, MonthlyBucket>()
		for (const transaction of transactions) {
			const key = formatDate(transaction.date, 'YYYY-MM')
			if (!monthly.has(key)) {
				monthly.set(key, {
					income: 0,
					expense: 0,
					debt: 0,
					buySell: 0,
					net: 0,
					startBalance: 0,
					endBalance: 0,
				})
			}

			const entry = monthly.get(key)
			if (!entry) continue
			toMonthlyNet(entry, transaction.type, transaction.amount.value)
		}

		const keys = Array.from(monthly.keys()).sort()
		const monthlyNet = keys.map((key) => {
			const entry = monthly.get(key)!
			return entry.income - entry.expense - entry.debt + entry.buySell
		})
		const totalChange = monthlyNet.reduce((sum, value) => sum + value, 0)
		let running = currentNetWorth - totalChange

		const steps: WaterfallStep[] = keys.map((key, index) => {
			const entry = monthly.get(key)!
			const net = monthlyNet[index] ?? 0
			const startBalance = running
			const endBalance = startBalance + net
			running = endBalance

			return {
				label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
				income: entry.income,
				expense: entry.expense,
				debt: entry.debt,
				buySell: entry.buySell,
				net,
				startBalance,
				endBalance,
			}
		})

		const summary = toNetWorthSummary(steps)
		if (steps.length === 0) {
			return {
				...summary,
				currentNetWorth,
				peakNetWorth: currentNetWorth,
				troughNetWorth: currentNetWorth,
			}
		}

		return {
			...summary,
			currentNetWorth,
		}
	}

	by.type = 'byNetWorthFromBalances'
	return by
}
