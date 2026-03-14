/** Raw transaction row as returned from SQLite before classification */
export interface RawTransaction {
	readonly id: number
	readonly entityType: number
	readonly date: number | null
	readonly amount: number | null
	readonly currency: string | null
	readonly payee: string | null
	readonly notes: string | null
	readonly accountId: number | null
	readonly accountName: string | null
	readonly accountEntityType: number | null
	readonly accountCurrency: string | null
	readonly categoryName: string | null
	readonly categoryParentName: string | null
	readonly tags: ReadonlyArray<{ category: string; name: string }>
}

/** Raw account row as returned from SQLite */
export interface RawAccount {
	readonly id: number
	readonly name: string
	readonly entityType: number
	readonly currency: string | null
}

/** Raw category assignment row */
export interface RawCategoryAssignment {
	readonly transactionId: number
	readonly categoryId: number
	readonly categoryName: string
	readonly parentName: string | null
}

/** Raw tag assignment row */
export interface RawTagAssignment {
	readonly transactionId: number
	readonly tagName: string
}
