import type { UploadRequest, WorkerResponse } from '../../client/types'
import { extractAll } from '../extractors'
import { openDatabase } from '../runtime'
import { getSnapshotWriter, workerState } from '../state'

export async function handleUpload(
	request: UploadRequest,
	respond: (r: WorkerResponse) => void
): Promise<void> {
	const start = performance.now()
	let sourceAvailable = true
	const source = {
		fileName: request.file.name,
		size: request.file.size,
		modifiedAt: request.file.lastModified,
		uploadedAt: new Date().toISOString(),
	}

	try {
		respond({
			type: 'progress',
			id: request.id,
			progress: { phase: 'import', processed: 0, error: 0, total: 1 },
		})

		// 1. Store source file in OPFS
		const { opfs, sourceFilename } = workerState
		try {
			await opfs.write(sourceFilename, request.file)
		} catch {
			sourceAvailable = false
		}

		// 2. Open the database
		const buffer = await request.file.arrayBuffer()
		const runtime = await openDatabase(buffer)

		// Close previous runtime if open
		workerState.db?.close()
		workerState.db = runtime

		// 3. Extract and classify data
		const { transactions, accounts } = await extractAll(runtime)

		respond({
			type: 'progress',
			id: request.id,
			progress: {
				phase: 'import',
				processed: 1,
				error: 0,
				total: 1,
			},
		})

		// 4. Write snapshot to IndexedDB
		const writer = getSnapshotWriter()
		await writer.clear()
		await writer.writeTransactions(
			transactions.transactions,
			(processed, total) => {
				respond({
					type: 'progress',
					id: request.id,
					progress: {
						phase: 'import',
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
			type: 'upload',
			id: request.id,
			result: {
				status: 'passed',
				message: `Imported ${transactions.transactions.length} transactions`,
				duration: performance.now() - start,
				transactionCount: transactions.transactions.length,
				sourceAvailable,
				source,
			},
		})
	} catch (err) {
		respond({
			type: 'upload',
			id: request.id,
			result: {
				status: 'failed',
				message: err instanceof Error ? err.message : String(err),
				duration: performance.now() - start,
				transactionCount: 0,
				sourceAvailable,
				source,
			},
		})
	}
}
