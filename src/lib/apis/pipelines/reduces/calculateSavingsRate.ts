import type { ReduceFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export interface SavingsRate {
	readonly income: number
	readonly expense: number
	readonly rate: number
}

const INCOME_TYPES = new Set(['income', 'refund', 'windfall', 'debt_repayment'])
const EXPENSE_TYPES = new Set(['expense', 'giveaway', 'debt'])

/**
 * Compute savings rate = (income - |expense|) / income.
 * Returns 0 when income is zero.
 */
export function calculateSavingsRate(): ReduceFn<DataTransaction, SavingsRate> {
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

		const absExpense = Math.abs(expense)
		const rate = income === 0 ? 0 : (income - absExpense) / income

		return { income, expense, rate }
	}
}
