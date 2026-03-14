import type { DataAccounts } from './accounts/types.js'
import type { DataTransactions } from './transactions/types.js'
import type { SnapshotReader } from '$lib/providers/indexdb/snapshot.js'
import type { Versionable } from '$lib/types/index.js'

export type RecordGetter<D> = () => Promise<D>

export interface RecordApiV1 extends Versionable<'record', 1> {
	getAccounts: RecordGetter<DataAccounts>
	getTransactions: RecordGetter<DataTransactions>
}

export function createRecordApi(reader: SnapshotReader): RecordApiV1 {
	return {
		name: 'record',
		version: 1,

		async getAccounts(): Promise<DataAccounts> {
			const accounts = await reader.getAccounts()
			return accounts ?? { name: 'accounts', type: 'record', accounts: [] }
		},

		async getTransactions(): Promise<DataTransactions> {
			const transactions = await reader.getAllTransactions()
			return { name: 'transactions', type: 'record', transactions }
		},
	}
}
