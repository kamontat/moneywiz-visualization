import type {
	ParsedBaseTransaction,
	ParsedCategory,
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedGiveawayTransaction,
	ParsedWindfallTransaction,
} from '$lib/transactions/models'
import {
	isDebtCategory,
	isDebtRepaymentCategory,
	isGiveawayCategory,
	isWindfallCategory,
} from '$lib/transactions/utils'

const CHECK_NUMBER = ''

type DebtCandidate =
	| ParsedDebtTransaction
	| ParsedDebtRepaymentTransaction
	| ParsedWindfallTransaction
	| ParsedGiveawayTransaction

export const classifyDebtCategory = (
	base: ParsedBaseTransaction,
	payee: string,
	category: ParsedCategory
): DebtCandidate | undefined => {
	if (isDebtCategory(category)) {
		return {
			...base,
			type: 'Debt',
			payee,
			category,
			checkNumber: CHECK_NUMBER,
		} as ParsedDebtTransaction
	}

	if (isDebtRepaymentCategory(category)) {
		return {
			...base,
			type: 'DebtRepayment',
			payee,
			category,
			checkNumber: CHECK_NUMBER,
		} as ParsedDebtRepaymentTransaction
	}

	if (isWindfallCategory(category)) {
		return {
			...base,
			type: 'Windfall',
			payee,
			category,
			checkNumber: CHECK_NUMBER,
		} as ParsedWindfallTransaction
	}

	if (isGiveawayCategory(category)) {
		return {
			...base,
			type: 'Giveaway',
			payee,
			category,
			checkNumber: CHECK_NUMBER,
		} as ParsedGiveawayTransaction
	}

	return undefined
}
