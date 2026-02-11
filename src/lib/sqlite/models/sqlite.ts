export interface SQLiteParseMeta {
	fileName: string
	fileSizeBytes: number
	parsedAt: string
	parseDurationMs: number
	maxTransactions?: number
}

export interface SQLiteParseCounts {
	syncObjectRows: number
	accounts: number
	payees: number
	categories: number
	tags: number
	transactions: number
}

export interface SQLiteEntityCount {
	entityId: number
	entityName: string
	rowCount: number
}

export interface SQLiteAccount {
	id: number
	entityId: number
	entityName: string
	name: string
	currency?: string
}

export interface SQLitePayee {
	id: number
	name: string
}

export interface SQLiteTag {
	id: number
	name: string
}

export interface SQLiteCategory {
	id: number
	name: string
	parentId?: number
	parentName?: string
}

export interface SQLiteAccountRef {
	id: number
	name: string
	entityId?: number
	entityName?: string
}

export interface SQLitePayeeRef {
	id: number
	name: string
}

export interface SQLiteTagRef {
	id: number
	name: string
}

export interface SQLiteCategoryRef {
	id: number
	name: string
	parentId?: number
	parentName?: string
}

export interface SQLiteTransaction {
	id: number
	entityId: number
	entityName: string
	date?: string
	amount?: number
	originalAmount?: number
	currency?: string
	description: string
	memo: string
	status?: number
	reconciled?: boolean
	account?: SQLiteAccountRef
	senderAccount?: SQLiteAccountRef
	recipientAccount?: SQLiteAccountRef
	payee?: SQLitePayeeRef
	categories: SQLiteCategoryRef[]
	tags: SQLiteTagRef[]
}

export interface SQLiteParseProgress {
	phase:
		| 'loading'
		| 'lookups'
		| 'categories'
		| 'tags'
		| 'transactions'
		| 'complete'
	processed: number
	total?: number
}

export interface ParseSQLiteOptions {
	maxTransactions?: number
	onProgress?: (progress: SQLiteParseProgress) => void
}

export interface SQLiteOverview {
	meta: SQLiteParseMeta
	counts: SQLiteParseCounts
	entities: SQLiteEntityCount[]
}

export type SQLiteSection =
	| 'accounts'
	| 'payees'
	| 'categories'
	| 'tags'
	| 'transactions'

export interface SQLitePageRequest {
	section: SQLiteSection
	offset: number
	limit: number
}

interface SQLitePageBase {
	section: SQLiteSection
	offset: number
	limit: number
	total: number
}

export interface SQLiteAccountsPage extends SQLitePageBase {
	section: 'accounts'
	items: SQLiteAccount[]
}

export interface SQLitePayeesPage extends SQLitePageBase {
	section: 'payees'
	items: SQLitePayee[]
}

export interface SQLiteCategoriesPage extends SQLitePageBase {
	section: 'categories'
	items: SQLiteCategory[]
}

export interface SQLiteTagsPage extends SQLitePageBase {
	section: 'tags'
	items: SQLiteTag[]
}

export interface SQLiteTransactionsPage extends SQLitePageBase {
	section: 'transactions'
	items: SQLiteTransaction[]
}

export type SQLiteSectionPage =
	| SQLiteAccountsPage
	| SQLitePayeesPage
	| SQLiteCategoriesPage
	| SQLiteTagsPage
	| SQLiteTransactionsPage

export interface SQLiteParseResult {
	meta: SQLiteParseMeta
	counts: SQLiteParseCounts
	entities: SQLiteEntityCount[]
	accounts: SQLiteAccount[]
	payees: SQLitePayee[]
	categories: SQLiteCategory[]
	tags: SQLiteTag[]
	transactions: SQLiteTransaction[]
}
