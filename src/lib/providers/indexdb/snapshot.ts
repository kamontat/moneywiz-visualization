import type { IndexdbTable } from '.'
import type { DataAccounts } from '$lib/apis/record/accounts/types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export interface SnapshotManifest {
	readonly version: number
	readonly createdAt: string
	readonly transactionCount: number
	readonly accountCount: number
	readonly sourceFile: string | null
}

export interface SnapshotSourceMetadata {
	readonly fileName: string
	readonly size: number
	readonly modifiedAt: number
	readonly uploadedAt: string
}

const MANIFEST_KEY = 'snapshot'
const META_ACCOUNTS_KEY = 'accounts'
const META_SOURCE_KEY = 'source'
const BATCH_SIZE = 1000

export class SnapshotWriter {
	constructor(
		private readonly manifest: IndexdbTable<'manifest'>,
		private readonly meta: IndexdbTable<'meta'>,
		private readonly transactions: IndexdbTable<'transactions'>
	) {}

	async writeTransactions(
		txns: readonly DataTransaction[],
		onBatch?: (processed: number, total: number) => void
	): Promise<void> {
		const total = txns.length
		for (let i = 0; i < total; i += BATCH_SIZE) {
			const batch = txns.slice(i, i + BATCH_SIZE)
			for (const tx of batch) {
				await this.transactions.set(String(tx.id), tx)
			}
			onBatch?.(Math.min(i + BATCH_SIZE, total), total)
		}
	}

	async writeAccounts(accounts: DataAccounts): Promise<void> {
		await this.meta.set(META_ACCOUNTS_KEY, accounts)
	}

	async writeSourceMetadata(source: SnapshotSourceMetadata): Promise<void> {
		await this.meta.set(META_SOURCE_KEY, source)
	}

	async writeManifest(
		transactionCount: number,
		accountCount: number,
		sourceFile: string | null
	): Promise<void> {
		const manifest: SnapshotManifest = {
			version: 1,
			createdAt: new Date().toISOString(),
			transactionCount,
			accountCount,
			sourceFile,
		}
		await this.manifest.set(MANIFEST_KEY, manifest)
	}

	async clear(): Promise<void> {
		await Promise.all([
			this.transactions.clear(),
			this.meta.clear(),
			this.manifest.clear(),
		])
	}
}

export class SnapshotReader {
	constructor(
		private readonly manifest: IndexdbTable<'manifest'>,
		private readonly meta: IndexdbTable<'meta'>,
		private readonly transactions: IndexdbTable<'transactions'>
	) {}

	async getManifest(): Promise<SnapshotManifest | undefined> {
		return this.manifest.get<SnapshotManifest>(MANIFEST_KEY)
	}

	async hasSnapshot(): Promise<boolean> {
		return this.manifest.has(MANIFEST_KEY)
	}

	async getAccounts(): Promise<DataAccounts | undefined> {
		return this.meta.get<DataAccounts>(META_ACCOUNTS_KEY)
	}

	async getSourceMetadata(): Promise<SnapshotSourceMetadata | undefined> {
		return this.meta.get<SnapshotSourceMetadata>(META_SOURCE_KEY)
	}

	async getAllTransactions(): Promise<DataTransaction[]> {
		const keys = await this.transactions.keys()
		const results: DataTransaction[] = []
		for (const key of keys) {
			const tx = await this.transactions.get<DataTransaction>(key)
			if (tx) results.push(tx)
		}
		return results
	}

	async getTransactionCount(): Promise<number> {
		const keys = await this.transactions.keys()
		return keys.length
	}
}
