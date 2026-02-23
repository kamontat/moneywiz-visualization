import type { ClearWorkerResult } from '$lib/source/sqlite/models'
import {
	clearLedgerMeta,
	clearLedgerTransactions,
	clearSessionManifest,
	getSessionManifest,
} from '$lib/ledger/repository'
import { clearSourceByBackend } from '$lib/source/sqlite/worker/backends'

export const handleClear = async (): Promise<ClearWorkerResult> => {
	const manifest = await getSessionManifest()
	await Promise.all([
		clearLedgerTransactions(),
		clearLedgerMeta(),
		clearSessionManifest(),
		clearSourceByBackend(manifest?.backend),
	])

	return { cleared: true }
}
