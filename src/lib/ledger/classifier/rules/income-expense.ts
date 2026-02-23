import type {
	ParsedBaseTransaction,
	ParsedCategory,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedUnknownTransaction,
} from '$lib/ledger/models'
import { isIncomeCategory } from '$lib/transactions/utils'

const CHECK_NUMBER = ''

export const classifyIncomeExpenseFallback = (
	base: ParsedBaseTransaction,
	input: {
		amount: number
		category: ParsedCategory
		hasCategory: boolean
		payee: string
	}
):
	| ParsedIncomeTransaction
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedUnknownTransaction => {
	if (input.amount > 0 && isIncomeCategory(input.category)) {
		return {
			...base,
			type: 'Income',
			payee: input.payee,
			category: input.category,
			checkNumber: CHECK_NUMBER,
		} as ParsedIncomeTransaction
	}

	if (input.amount < 0) {
		return {
			...base,
			type: 'Expense',
			payee: input.payee,
			category: input.category,
			checkNumber: CHECK_NUMBER,
		} as ParsedExpenseTransaction
	}

	if (!input.hasCategory || isIncomeCategory(input.category)) {
		return {
			...base,
			type: 'Unknown',
		} as ParsedUnknownTransaction
	}

	return {
		...base,
		type: 'Refund',
		payee: input.payee,
		category: input.category,
		checkNumber: CHECK_NUMBER,
	} as ParsedRefundTransaction
}
