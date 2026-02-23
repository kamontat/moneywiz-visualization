import type { Database } from '@sqlite.org/sqlite-wasm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	getSnapshotStatusMock,
	isSourceAvailableMock,
	openExistingOpfsSourceMock,
	rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifestMock,
} = vi.hoisted(() => ({
	getSnapshotStatusMock: vi.fn(),
	isSourceAvailableMock: vi.fn(),
	openExistingOpfsSourceMock: vi.fn(),
	rebuildSnapshotFromDatabaseMock: vi.fn(),
	writeSessionSnapshotManifestMock: vi.fn(),
}))

vi.mock('$lib/transactions/repository', () => ({
	getSnapshotStatus: getSnapshotStatusMock,
}))

vi.mock('$lib/source/sqlite/worker/backends', () => ({
	isSourceAvailable: isSourceAvailableMock,
	openExistingOpfsSource: openExistingOpfsSourceMock,
}))

vi.mock('$lib/source/sqlite/worker/writers', () => ({
	rebuildSnapshotFromDatabase: rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifest: writeSessionSnapshotManifestMock,
}))

import { handleBootstrap } from './bootstrap'

describe('handleBootstrap', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns ready immediately when snapshot is valid', async () => {
		getSnapshotStatusMock.mockResolvedValue({
			valid: true,
			transactionCount: 10,
			manifest: {
				backend: 'snapshot',
				sourceAvailable: false,
				source: undefined,
			},
		})

		const result = await handleBootstrap()

		expect(result.ready).toBe(true)
		expect(result.rebuilt).toBe(false)
		expect(rebuildSnapshotFromDatabaseMock).not.toHaveBeenCalled()
	})

	it('returns snapshot_unavailable when no rebuild source is available', async () => {
		getSnapshotStatusMock.mockResolvedValue({
			valid: false,
			transactionCount: 0,
			manifest: {
				backend: 'snapshot',
				sourceAvailable: false,
				source: undefined,
			},
		})
		isSourceAvailableMock.mockResolvedValue(false)

		const result = await handleBootstrap()

		expect(result.ready).toBe(false)
		expect(result.reason).toBe('snapshot_unavailable')
	})

	it('rebuilds snapshot from opfs source when needed', async () => {
		const close = vi.fn()
		getSnapshotStatusMock.mockResolvedValue({
			valid: false,
			transactionCount: 0,
			manifest: {
				backend: 'opfs',
				sourceAvailable: true,
				source: {
					fileName: 'report.sqlite',
					size: 100,
					modifiedAt: 1,
					uploadedAt: '2026-01-01T00:00:00.000Z',
					sourcePath: '/moneywiz/current.sqlite3',
				},
			},
		})
		isSourceAvailableMock.mockResolvedValue(true)
		openExistingOpfsSourceMock.mockResolvedValue({
			close,
		} as unknown as Database)
		rebuildSnapshotFromDatabaseMock.mockResolvedValue({
			transactionCount: 15,
			syncObjectRows: 80,
		})

		const result = await handleBootstrap()

		expect(result.ready).toBe(true)
		expect(result.rebuilt).toBe(true)
		expect(writeSessionSnapshotManifestMock).toHaveBeenCalledWith({
			backend: 'opfs',
			sourceAvailable: true,
			source: expect.objectContaining({ fileName: 'report.sqlite' }),
			transactionCount: 15,
		})
		expect(close).toHaveBeenCalledTimes(1)
	})
})
