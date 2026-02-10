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
	ParsedTransaction,
	ParsedSellTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
	ParsedWindfallTransaction,
} from './models'
import type { ParsedCsv, ParsedCsvRow } from '$lib/csv/models'
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

import { parseCsvFile } from '$lib/csv'
import { transaction } from '$lib/loggers'

const log = transaction.extends('parser')

export const parseTransactionsFile = async (
	file: File
): Promise<ParsedTransaction[]> => {
	log.debug('parsing transactions from file: %s', file.name)
	const csv = await parseCsvFile(file)
	return parseTransactions(csv)
}

export const parseTransactions = (csv: ParsedCsv): ParsedTransaction[] => {
	log.debug('parsing %d rows from CSV', csv.rows.length)

	const data = csv.rows.map((row: ParsedCsvRow) => {
		const account = parseAccount(getValue(row, CsvKey.Account))
		const amount = parseAmount(
			getValue(row, CsvKey.Amount),
			getValue(row, CsvKey.Currency)
		)
		const date = parseDate(
			getValue(row, CsvKey.Date),
			getValue(row, CsvKey.Time)
		)
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

		// Special category classification FIRST (before transfer/income/expense checks)
		// These categories override normal classification per RULES.md Section 1.5
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

		return {
			...base,
			type: 'Refund',
			payee,
			category,
			checkNumber,
		} as ParsedRefundTransaction
	})

	return data
}
