import type { BootstrapRequest, WorkerResponse } from '../../client/types'
import { extractAll } from '../extractors'
import { openDatabase } from '../runtime'
import { getSnapshotReader, getSnapshotWriter, workerState } from '../state'

export async function handleBootstrap(
	request: BootstrapRequest,
	respond: (r: WorkerResponse) => void
): Promise<void> {
	const start = performance.now()
	const reader = getSnapshotReader()
	const hasSource = await workerState.opfs.has(workerState.sourceFilename)

	// 1. Check if snapshot exists in IndexedDB
	const hasSnapshot = await reader.hasSnapshot()
	if (hasSnapshot) {
		respond({
			type: 'progress',
			id: request.id,
			progress: {
				phase: 'snapshot_load',
				processed: 0,
				error: 0,
				total: 1,
			},
		})

		const manifest = await reader.getManifest()
		const source = await reader.getSourceMetadata()
		respond({
			type: 'bootstrap',
			id: request.id,
			result: {
				mode: 'reused',
				status: 'passed',
				message: `Loaded ${manifest?.transactionCount ?? 0} transactions from snapshot`,
				duration: performance.now() - start,
				transactionCount: manifest?.transactionCount ?? 0,
				sourceAvailable: hasSource,
				source,
			},
		})
		return
	}

	// 2. Check if source file exists in OPFS
	const { opfs, sourceFilename } = workerState
	if (!hasSource) {
		respond({
			type: 'bootstrap',
			id: request.id,
			result: {
				mode: 'missed',
				status: 'missed',
				message: 'No data available',
				duration: performance.now() - start,
				transactionCount: 0,
				sourceAvailable: false,
			},
		})
		return
	}

	// 3. Rebuild snapshot from OPFS
	try {
		respond({
			type: 'progress',
			id: request.id,
			progress: {
				phase: 'source_import',
				processed: 0,
				error: 0,
				total: 1,
			},
		})

		const file = await opfs.read(sourceFilename)
		if (!file) throw new Error('Source file disappeared')
		const source = (await reader.getSourceMetadata()) ?? {
			fileName: file.name,
			size: file.size,
			modifiedAt: file.lastModified,
			uploadedAt: new Date().toISOString(),
		}

		const buffer = await file.arrayBuffer()
		const runtime = await openDatabase(buffer)
		workerState.db = runtime

		respond({
			type: 'progress',
			id: request.id,
			progress: {
				phase: 'snapshot_write',
				processed: 0,
				error: 0,
				total: 1,
			},
		})

		const { transactions, accounts } = await extractAll(runtime)
		const writer = getSnapshotWriter()
		await writer.clear()
		await writer.writeTransactions(
			transactions.transactions,
			(processed, total) => {
				respond({
					type: 'progress',
					id: request.id,
					progress: {
						phase: 'snapshot_write',
						processed,
						error: 0,
						total,
					},
				})
			}
		)
		await writer.writeAccounts(accounts)
		await writer.writeSourceMetadata(source)
		await writer.writeManifest(
			transactions.transactions.length,
			accounts.accounts.length,
			sourceFilename
		)

		respond({
			type: 'progress',
			id: request.id,
			progress: {
				phase: 'complete',
				processed: transactions.transactions.length,
				error: 0,
				total: transactions.transactions.length,
			},
		})

		respond({
			type: 'bootstrap',
			id: request.id,
			result: {
				mode: 'rebuilt',
				status: 'passed',
				message: `Rebuilt snapshot with ${transactions.transactions.length} transactions`,
				duration: performance.now() - start,
				transactionCount: transactions.transactions.length,
				sourceAvailable: true,
				source,
			},
		})
	} catch (err) {
		respond({
			type: 'bootstrap',
			id: request.id,
			result: {
				mode: 'rebuilt',
				status: 'failed',
				message: err instanceof Error ? err.message : String(err),
				duration: performance.now() - start,
				transactionCount: 0,
				sourceAvailable: true,
			},
		})
	}
}
