import type { Database } from '@sqlite.org/sqlite-wasm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	getSessionManifestMock,
	openExistingOpfsSourceMock,
	rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifestMock,
} = vi.hoisted(() => ({
	getSessionManifestMock: vi.fn(),
	openExistingOpfsSourceMock: vi.fn(),
	rebuildSnapshotFromDatabaseMock: vi.fn(),
	writeSessionSnapshotManifestMock: vi.fn(),
}))

vi.mock('$lib/ledger/repository', () => ({
	getSessionManifest: getSessionManifestMock,
}))

vi.mock('$lib/source/sqlite/worker/backends', () => ({
	openExistingOpfsSource: openExistingOpfsSourceMock,
}))

vi.mock('$lib/source/sqlite/worker/writers', () => ({
	rebuildSnapshotFromDatabase: rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifest: writeSessionSnapshotManifestMock,
}))

import { handleRebuildSnapshot } from './rebuild-snapshot'

describe('handleRebuildSnapshot', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns missing manifest reason when opfs manifest is unavailable', async () => {
		getSessionManifestMock.mockResolvedValue(undefined)

		const result = await handleRebuildSnapshot()

		expect(result.ready).toBe(false)
		expect(result.reason).toBe('opfs_manifest_missing')
	})

	it('returns source missing reason when opfs source cannot be opened', async () => {
		getSessionManifestMock.mockResolvedValue({
			backend: 'opfs',
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
		})
		openExistingOpfsSourceMock.mockResolvedValue(undefined)

		const result = await handleRebuildSnapshot()

		expect(result.ready).toBe(false)
		expect(result.reason).toBe('opfs_source_missing')
	})

	it('rebuilds and rewrites manifest when opfs source exists', async () => {
		const close = vi.fn()
		getSessionManifestMock.mockResolvedValue({
			backend: 'opfs',
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
		})
		openExistingOpfsSourceMock.mockResolvedValue({
			close,
		} as unknown as Database)
		rebuildSnapshotFromDatabaseMock.mockResolvedValue({
			transactionCount: 77,
			syncObjectRows: 500,
		})

		const result = await handleRebuildSnapshot()

		expect(result.ready).toBe(true)
		expect(result.rebuilt).toBe(true)
		expect(result.transactionCount).toBe(77)
		expect(writeSessionSnapshotManifestMock).toHaveBeenCalledTimes(1)
		expect(close).toHaveBeenCalledTimes(1)
	})
})
