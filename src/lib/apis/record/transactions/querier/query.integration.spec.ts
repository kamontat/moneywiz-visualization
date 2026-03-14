import { describe, expect, it } from 'vitest'

import {
	generateSQLite,
	defaultRecord,
} from '../../../../../../e2e/utils/sqlite-generator.ts'

import { queryTransactions } from './query.js'

import { classifyAccounts } from '$lib/apis/record/accounts/index.js'
import { queryAccounts } from '$lib/apis/record/accounts/querier/query.js'
import { classifyTransactions } from '$lib/apis/record/transactions/classifier/classify.js'
import { openDatabase } from '$lib/apis/sqlite/worker/runtime/database.js'

describe('queryTransactions integration', () => {
	it('extracts and classifies a generated MoneyWiz fixture', async () => {
		const buffer = generateSQLite({ transactions: [defaultRecord] })
		const arrayBuffer = new ArrayBuffer(buffer.byteLength)
		new Uint8Array(arrayBuffer).set(buffer)
		const db = await openDatabase(arrayBuffer)

		try {
			const [rawTransactions, rawAccounts] = await Promise.all([
				queryTransactions(db),
				queryAccounts(db),
			])

			expect(rawAccounts).toHaveLength(1)
			expect(rawTransactions).toHaveLength(1)
			expect(rawTransactions[0]?.payee).toBe(defaultRecord.payee)
			expect(rawTransactions[0]?.categoryName).toBe(defaultRecord.category)
			expect(rawTransactions[0]?.categoryParentName).toBe(
				defaultRecord.parentCategory
			)

			const accounts = classifyAccounts(rawAccounts)
			const transactions = classifyTransactions(rawTransactions)

			expect(accounts.accounts).toHaveLength(1)
			expect(transactions.transactions).toHaveLength(1)
			expect(transactions.transactions[0]?.type).toBe('expense')
		} finally {
			db.close()
		}
	})
})
