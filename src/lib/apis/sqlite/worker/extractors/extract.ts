import type { DataAccounts } from '$lib/apis/record/accounts/types'
import type { DataTransactions } from '$lib/apis/record/transactions/types'
import type { Queriable } from '$lib/types'
import {
	classifyAccounts,
	queryAccounts,
} from '$lib/apis/record/accounts'
import { classifyTransactions } from '$lib/apis/record/transactions/classifier'
import { queryTransactions } from '$lib/apis/record/transactions/querier'

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
