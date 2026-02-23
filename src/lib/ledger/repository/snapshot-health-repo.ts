import type { LedgerMetaRecord, SnapshotStatus } from '$lib/ledger/models'
import type { SessionManifest } from '$lib/session/models'
import { openLedgerDB } from './open-ledger-db'
import { getLedgerTransactionCount } from './transaction-read-repo'

import {
	STORE_LEDGER_META_V2,
	STORE_SESSION_MANIFEST_V2,
} from '$lib/ledger/models'

const SNAPSHOT_READY_KEY = 'snapshotReady'
const SNAPSHOT_COUNT_KEY = 'transactionCount'

export const getSessionManifest = async (): Promise<
	SessionManifest | undefined
> => {
	const database = await openLedgerDB()
	try {
		return database.get(STORE_SESSION_MANIFEST_V2, 'current')
	} finally {
		database.close()
	}
}

export const setSessionManifest = async (
	manifest: SessionManifest
): Promise<void> => {
	const database = await openLedgerDB()
	try {
		await database.put(STORE_SESSION_MANIFEST_V2, manifest)
	} finally {
		database.close()
	}
}

export const clearSessionManifest = async (): Promise<void> => {
	const database = await openLedgerDB()
	try {
		await database.delete(STORE_SESSION_MANIFEST_V2, 'current')
	} finally {
		database.close()
	}
}

export const getLedgerMeta = async (
	key: string
): Promise<unknown | undefined> => {
	const database = await openLedgerDB()
	try {
		const value = await database.get(STORE_LEDGER_META_V2, key)
		return value?.value
	} finally {
		database.close()
	}
}

export const setLedgerMeta = async (
	key: string,
	value: unknown
): Promise<void> => {
	const database = await openLedgerDB()
	try {
		const payload: LedgerMetaRecord = { key, value }
		await database.put(STORE_LEDGER_META_V2, payload)
	} finally {
		database.close()
	}
}

export const clearLedgerMeta = async (): Promise<void> => {
	const database = await openLedgerDB()
	try {
		await database.clear(STORE_LEDGER_META_V2)
	} finally {
		database.close()
	}
}

export const markSnapshotReady = async (
	transactionCount: number
): Promise<void> => {
	await Promise.all([
		setLedgerMeta(SNAPSHOT_READY_KEY, true),
		setLedgerMeta(SNAPSHOT_COUNT_KEY, transactionCount),
	])
}

export const getSnapshotStatus = async (): Promise<SnapshotStatus> => {
	const [manifest, readyFlag, countMeta, count] = await Promise.all([
		getSessionManifest(),
		getLedgerMeta(SNAPSHOT_READY_KEY),
		getLedgerMeta(SNAPSHOT_COUNT_KEY),
		getLedgerTransactionCount(),
	])

	const transactionCount =
		typeof countMeta === 'number' && Number.isFinite(countMeta)
			? countMeta
			: count

	return {
		valid: manifest !== undefined && readyFlag === true,
		transactionCount,
		manifest,
	}
}
