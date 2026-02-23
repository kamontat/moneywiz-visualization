import type {
	ParsedBaseTransaction,
	ParsedBuyTransaction,
	ParsedSellTransaction,
} from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'

const CHECK_NUMBER = ''

const isInvestmentBuyEntity = (entityId: number): boolean => {
	return entityId === SQLITE_ENTITY_ID.InvestmentBuyTransaction
}

const isInvestmentSellEntity = (entityId: number): boolean => {
	return entityId === SQLITE_ENTITY_ID.InvestmentSellTransaction
}

export const classifyInvestmentEntity = (
	row: SQLiteTransaction,
	base: ParsedBaseTransaction,
	payee: string
): ParsedBuyTransaction | ParsedSellTransaction | undefined => {
	if (isInvestmentBuyEntity(row.entityId)) {
		return {
			...base,
			type: 'Buy',
			payee,
			checkNumber: CHECK_NUMBER,
		} as ParsedBuyTransaction
	}

	if (isInvestmentSellEntity(row.entityId)) {
		return {
			...base,
			type: 'Sell',
			payee,
			checkNumber: CHECK_NUMBER,
		} as ParsedSellTransaction
	}

	return undefined
}

export const classifyInvestmentFallback = (
	base: ParsedBaseTransaction,
	input: {
		accountType: string
		hasCategory: boolean
		amount: number
		payee: string
	}
): ParsedBuyTransaction | ParsedSellTransaction | undefined => {
	if (input.accountType !== 'Investment' || input.hasCategory) return undefined

	if (input.amount > 0) {
		return {
			...base,
			type: 'Sell',
			payee: input.payee,
			checkNumber: CHECK_NUMBER,
		} as ParsedSellTransaction
	}

	if (input.amount < 0) {
		return {
			...base,
			type: 'Buy',
			payee: input.payee,
			checkNumber: CHECK_NUMBER,
		} as ParsedBuyTransaction
	}

	return undefined
}
