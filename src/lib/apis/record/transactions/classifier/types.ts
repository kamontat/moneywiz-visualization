import type { RawTransaction } from '../querier/types'
import type { TransactionType } from '../types'

export interface ClassificationContext {
	readonly raw: RawTransaction
	readonly date: Date
	readonly amount: number
	readonly currency: string
	readonly category: string
	readonly subcategory: string
	readonly payee: string
	readonly accountId: number
	readonly accountName: string
	readonly accountEntityType: number | null
}

export interface ClassificationRule {
	readonly name: string
	match(ctx: ClassificationContext): TransactionType | null
}
