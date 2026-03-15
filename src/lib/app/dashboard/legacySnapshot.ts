import type { DataAccount } from '$lib/apis/record/accounts/types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'
import type { DataController } from '$lib/app/controllers/dataController'
import type {
	ParsedAccount,
	ParsedAccountType,
	ParsedCategory,
	ParsedTransaction,
} from '$lib/transactions/models'
import { openDB } from 'idb'

import { createRecordApi } from '$lib/apis/record/v1'
import { createDataController } from '$lib/app/controllers/dataController'
import { SnapshotReader } from '$lib/providers/indexdb/snapshot'

const DB_NAME = 'moneywiz-v3'
const DB_VERSION = 1
const STORES = ['manifest', 'meta', 'transactions'] as const

const ACCOUNT_TYPE_MAP: Record<DataAccount['type'], ParsedAccountType> = {
	wallet: 'Wallet',
	checking: 'Checking',
	creditcard: 'CreditCard',
	loan: 'Loan',
	investment: 'Investment',
	unknown: 'Unknown',
}

export interface LegacyDashboardSnapshot {
	readonly transactionCount: number
	readonly transactions: ParsedTransaction[]
	readonly controller: DataController
}

async function createSnapshotReader(): Promise<SnapshotReader> {
	const { IndexdbProvider } = await import('$lib/providers/indexdb')
	const engine = openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			for (const store of STORES) {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store)
				}
			}
		},
	})
	const indexdb = new IndexdbProvider(engine)

	return new SnapshotReader(
		indexdb.table('manifest'),
		indexdb.table('meta'),
		indexdb.table('transactions')
	)
}

function toParsedAccount(account: DataAccount): ParsedAccount {
	return {
		type: ACCOUNT_TYPE_MAP[account.type],
		name: account.name,
		extra: null,
	}
}

function toParsedCategory(transaction: DataTransaction): ParsedCategory {
	return {
		category: transaction.category || 'Uncategorized',
		subcategory: transaction.subcategory,
	}
}

function toParsedTransactionBase(transaction: DataTransaction) {
	const account = toParsedAccount({
		id: transaction.accountId,
		name: transaction.accountName,
		currency: transaction.currency,
		type: 'unknown',
	})

	return {
		id: transaction.id,
		account,
		description: transaction.notes || transaction.payee || transaction.category,
		amount: {
			value: transaction.amount,
			currency: transaction.currency,
		},
		date:
			transaction.date instanceof Date
				? transaction.date
				: new Date(transaction.date),
		memo: transaction.notes,
		tags: [...transaction.tags],
		raw: {
			...transaction,
		},
	}
}

export function toParsedTransaction(
	transaction: DataTransaction
): ParsedTransaction {
	const base = toParsedTransactionBase(transaction)
	const payee = transaction.payee
	const category = toParsedCategory(transaction)
	const checkNumber = ''

	switch (transaction.type) {
		case 'expense':
			return {
				...base,
				type: 'Expense',
				payee,
				category,
				checkNumber,
			}
		case 'refund':
			return {
				...base,
				type: 'Refund',
				payee,
				category,
				checkNumber,
			}
		case 'income':
			return {
				...base,
				type: 'Income',
				payee,
				category,
				checkNumber,
			}
		case 'debt':
			return {
				...base,
				type: 'Debt',
				payee,
				category,
				checkNumber,
			}
		case 'debt_repayment':
			return {
				...base,
				type: 'DebtRepayment',
				payee,
				category,
				checkNumber,
			}
		case 'windfall':
			return {
				...base,
				type: 'Windfall',
				payee,
				category,
				checkNumber,
			}
		case 'giveaway':
			return {
				...base,
				type: 'Giveaway',
				payee,
				category,
				checkNumber,
			}
		case 'transfer':
			return {
				...base,
				type: 'Transfer',
				transfer: base.account,
			}
		case 'buy':
			return {
				...base,
				type: 'Buy',
				payee,
				checkNumber,
			}
		case 'sell':
			return {
				...base,
				type: 'Sell',
				payee,
				checkNumber,
			}
		case 'reconcile':
			return {
				...base,
				type: 'Reconcile',
				payee,
				checkNumber,
			}
		case 'unknown':
			return {
				...base,
				type: 'Unknown',
			}
	}
}

export async function loadLegacyDashboardSnapshot(): Promise<LegacyDashboardSnapshot> {
	if (typeof indexedDB === 'undefined') {
		const controller = createDataController({
			name: 'record',
			version: 1,
			async getAccounts() {
				return { name: 'accounts', type: 'record', accounts: [] }
			},
			async getTransactions() {
				return { name: 'transactions', type: 'record', transactions: [] }
			},
		})

		return {
			transactionCount: 0,
			transactions: [],
			controller,
		}
	}

	const reader = await createSnapshotReader()
	const recordApi = createRecordApi(reader)
	const dataController = createDataController(recordApi)

	await dataController.loadAll()

	const transactions = dataController
		.getAllTransactions()
		.map(toParsedTransaction)
	const manifest = await reader.getManifest()

	return {
		transactionCount: manifest?.transactionCount ?? transactions.length,
		transactions,
		controller: dataController,
	}
}
