import type { DataAccounts } from '$lib/apis/record/accounts/types.js'
import type { DataTransactions } from '$lib/apis/record/transactions/types.js'
import type { Queriable } from '$lib/types/index.js'
import {
	classifyAccounts,
	queryAccounts,
} from '$lib/apis/record/accounts/index.js'
import { classifyTransactions } from '$lib/apis/record/transactions/classifier/index.js'
import { queryTransactions } from '$lib/apis/record/transactions/querier/index.js'

export interface ExtractionResult {
	transactions: DataTransactions
	accounts: DataAccounts
}

export async function extractAll(db: Queriable): Promise<ExtractionResult> {
	const [rawTransactions, rawAccounts] = await Promise.all([
		queryTransactions(db),
		queryAccounts(db),
	])

	const transactions = classifyTransactions(rawTransactions)
	const accounts = classifyAccounts(rawAccounts)

	return { transactions, accounts }
}
