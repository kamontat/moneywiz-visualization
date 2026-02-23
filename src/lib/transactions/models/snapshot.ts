import type { DBSchema } from 'idb'
import type { ParsedTransaction } from './state'
import type { SessionManifest } from '$lib/session/models'

export const LEDGER_DB_NAME = 'moneywiz-ledger-v2' as const
export const LEDGER_DB_VERSION = 1 as const

export const STORE_SESSION_MANIFEST_V2 = 'session_manifest_v2' as const
export const STORE_LEDGER_TRANSACTIONS_V2 = 'ledger_transactions_v2' as const
export const STORE_LEDGER_META_V2 = 'ledger_meta_v2' as const

export interface LedgerMetaRecord {
	key: string
	value: unknown
}

export interface SnapshotStatus {
	valid: boolean
	transactionCount: number
	manifest?: SessionManifest
}

export interface LedgerDBSchema extends DBSchema {
	session_manifest_v2: {
		key: 'current'
		value: SessionManifest
	}
	ledger_transactions_v2: {
		key: number
		value: ParsedTransaction
		indexes: {
			date: Date
			type: string
			account: string
		}
	}
	ledger_meta_v2: {
		key: string
		value: LedgerMetaRecord
	}
}
