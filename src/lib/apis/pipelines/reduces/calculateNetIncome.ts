import type { ReduceFn } from '../types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'

export interface NetIncome {
	readonly income: number
	readonly expense: number
	readonly net: number
}

const INCOME_TYPES = new Set(['income', 'refund', 'windfall', 'debt_repayment'])
const EXPENSE_TYPES = new Set(['expense', 'giveaway', 'debt'])

export function calculateNetIncome(): ReduceFn<DataTransaction, NetIncome> {
	return (init, input) => {
		let income = init.income
		let expense = init.expense

		for (const tx of input) {
			if (INCOME_TYPES.has(tx.type)) {
				income += tx.amount
			} else if (EXPENSE_TYPES.has(tx.type)) {
				expense += tx.amount
			}
		}

		return { income, expense, net: income + expense }
	}
}
