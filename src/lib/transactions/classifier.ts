import type { ParsedTransaction } from './models'
import type {
	ParsedBaseTransaction,
	ParsedBuyTransaction,
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedNewBalanceTransaction,
	ParsedRefundTransaction,
	ParsedSellTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
	ParsedWindfallTransaction,
} from './models/transaction'
import type { ParsedCsvRow } from '$lib/csv/models'
import { CsvKey, getValue } from './csv'
import {
	isDebtCategory,
	isDebtRepaymentCategory,
	isGiveawayCategory,
	isIncomeCategory,
	isNewBalanceDescription,
	isWindfallCategory,
	parseAccount,
	parseAmount,
	parseCategory,
	parseDate,
	parseTag,
} from './utils'

export const parseCsvRowToTransaction = (
	row: ParsedCsvRow
): ParsedTransaction => {
	const account = parseAccount(getValue(row, CsvKey.Account))
	const amount = parseAmount(
		getValue(row, CsvKey.Amount),
		getValue(row, CsvKey.Currency)
	)
	const date = parseDate(getValue(row, CsvKey.Date), getValue(row, CsvKey.Time))
	const description = getValue(row, CsvKey.Description)
	const memo = getValue(row, CsvKey.Memo)
	const tags = parseTag(getValue(row, CsvKey.Tags))

	const base: ParsedBaseTransaction = {
		account,
		amount,
		date,
		description,
		memo,
		tags,
		raw: row,
	}

	const transferField = getValue(row, CsvKey.Transfers)
	const categoryField = getValue(row, CsvKey.Category)
	const payee = getValue(row, CsvKey.Payee)
	const category = parseCategory(categoryField)
	const checkNumber = getValue(row, CsvKey.CheckNumber)
	const hasCategory = categoryField && categoryField.trim() !== ''

	if (isDebtCategory(category)) {
		return {
			...base,
			type: 'Debt',
			payee,
			category,
			checkNumber,
		} as ParsedDebtTransaction
	}

	if (isDebtRepaymentCategory(category)) {
		return {
			...base,
			type: 'DebtRepayment',
			payee,
			category,
			checkNumber,
		} as ParsedDebtRepaymentTransaction
	}

	if (isWindfallCategory(category)) {
		return {
			...base,
			type: 'Windfall',
			payee,
			category,
			checkNumber,
		} as ParsedWindfallTransaction
	}

	if (isGiveawayCategory(category)) {
		return {
			...base,
			type: 'Giveaway',
			payee,
			category,
			checkNumber,
		} as ParsedGiveawayTransaction
	}

	if (!hasCategory && isNewBalanceDescription(description)) {
		return {
			...base,
			type: 'NewBalance',
			payee,
			checkNumber,
		} as ParsedNewBalanceTransaction
	}

	// Transfer classification per RULES.md:
	// - Pure Transfer: Transfers field populated AND no Category
	// - Transfer with Category: Classify as Income/Expense/Refund with transfer as payee
	if (transferField) {
		if (hasCategory) {
			const transferPayee = parseAccount(transferField).name

			if (amount.value > 0 && isIncomeCategory(category)) {
				return {
					...base,
					type: 'Income',
					payee: transferPayee,
					category,
					checkNumber,
				} as ParsedIncomeTransaction
			}

			if (amount.value < 0) {
				return {
					...base,
					type: 'Expense',
					payee: transferPayee,
					category,
					checkNumber,
				} as ParsedExpenseTransaction
			}

			if (isIncomeCategory(category)) {
				return {
					...base,
					type: 'Unknown',
				} as ParsedUnknownTransaction
			}

			return {
				...base,
				type: 'Refund',
				payee: transferPayee,
				category,
				checkNumber,
			} as ParsedRefundTransaction
		}
		return {
			...base,
			type: 'Transfer',
			transfer: parseAccount(transferField),
		} as ParsedTransferTransaction
	}

	if (account.type === 'Investment' && !hasCategory) {
		if (amount.value > 0) {
			return {
				...base,
				type: 'Sell',
				payee,
				checkNumber,
			} as ParsedSellTransaction
		}
		if (amount.value < 0) {
			return {
				...base,
				type: 'Buy',
				payee,
				checkNumber,
			} as ParsedBuyTransaction
		}
	}

	// Transaction classification per RULES.md:
	// - Income: Amount > 0 AND category starts with Compensation or Income
	// - Expense: Amount < 0 AND NOT income category
	// - Refund: requires category and NOT income category (reduces expense totals)
	// - Unknown: fallback when category is missing
	if (amount.value > 0 && isIncomeCategory(category)) {
		return {
			...base,
			type: 'Income',
			payee,
			category,
			checkNumber,
		} as ParsedIncomeTransaction
	}

	if (amount.value < 0) {
		return {
			...base,
			type: 'Expense',
			payee,
			category,
			checkNumber,
		} as ParsedExpenseTransaction
	}

	if (!hasCategory) {
		return {
			...base,
			type: 'Unknown',
		} as ParsedUnknownTransaction
	}

	if (isIncomeCategory(category)) {
		return {
			...base,
			type: 'Unknown',
		} as ParsedUnknownTransaction
	}

	// Fallback with expense category = Refund
	return {
		...base,
		type: 'Refund',
		payee,
		category,
		checkNumber,
	} as ParsedRefundTransaction
}
