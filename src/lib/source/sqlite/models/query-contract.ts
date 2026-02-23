import type {
	SQLiteAccount,
	SQLiteCategory,
	SQLiteEntityCount,
	SQLitePayee,
	SQLiteTag,
	SQLiteTagRef,
	SQLiteCategoryRef,
	SQLiteTransaction,
	SQLiteUser,
} from '$lib/source/sqlite/models'

export interface SQLiteLookups {
	entityNameById: Map<number, string>
	entities: SQLiteEntityCount[]
	accounts: SQLiteAccount[]
	payees: SQLitePayee[]
	categories: SQLiteCategory[]
	tags: SQLiteTag[]
	users: SQLiteUser[]
	activeUser?: SQLiteUser
}

export interface SQLiteRelations {
	categoriesByTransaction: Map<number, SQLiteCategoryRef[]>
	tagsByTransaction: Map<number, SQLiteTagRef[]>
}

export interface SQLiteExtractionSummary {
	transactionCount: number
	syncObjectRows: number
}

export type SQLiteTransactionHandler = (
	transaction: SQLiteTransaction
) => Promise<void> | void
