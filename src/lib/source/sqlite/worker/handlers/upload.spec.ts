import type { Database } from '@sqlite.org/sqlite-wasm'
import type { SessionProgress } from '$lib/session/models'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	clearSourceByBackendMock,
	openSnapshotSourceMock,
	openUploadedSourceMock,
	rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifestMock,
} = vi.hoisted(() => ({
	clearSourceByBackendMock: vi.fn(),
	openSnapshotSourceMock: vi.fn(),
	openUploadedSourceMock: vi.fn(),
	rebuildSnapshotFromDatabaseMock: vi.fn(),
	writeSessionSnapshotManifestMock: vi.fn(),
}))

vi.mock('$lib/source/sqlite/worker/backends', () => ({
	clearSourceByBackend: clearSourceByBackendMock,
	openSnapshotSource: openSnapshotSourceMock,
	openUploadedSource: openUploadedSourceMock,
}))

vi.mock('$lib/source/sqlite/worker/writers', () => ({
	rebuildSnapshotFromDatabase: rebuildSnapshotFromDatabaseMock,
	writeSessionSnapshotManifest: writeSessionSnapshotManifestMock,
}))

import { handleUpload } from './upload'

describe('handleUpload', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('imports source, rebuilds snapshot, writes manifest, and closes db', async () => {
		const close = vi.fn()
		openUploadedSourceMock.mockResolvedValue({
			backend: 'opfs',
			sourceAvailable: true,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
			db: { close } as unknown as Database,
		})
		rebuildSnapshotFromDatabaseMock.mockResolvedValue({
			transactionCount: 42,
			syncObjectRows: 120,
		})

		const progress: SessionProgress[] = []
		const result = await handleUpload(
			new File(['db'], 'report.sqlite'),
			(next) => progress.push(next)
		)

		expect(progress[0]).toEqual({
			phase: 'source_import',
			processed: 0,
			percentage: 0,
		})
		expect(rebuildSnapshotFromDatabaseMock).toHaveBeenCalledTimes(1)
		expect(writeSessionSnapshotManifestMock).toHaveBeenCalledWith({
			backend: 'opfs',
			sourceAvailable: true,
			source: expect.objectContaining({ fileName: 'report.sqlite' }),
			transactionCount: 42,
		})
		expect(close).toHaveBeenCalledTimes(1)
		expect(result.transactionCount).toBe(42)
	})

	it('falls back to snapshot when opfs rebuild fails with SQLITE_CANTOPEN', async () => {
		const closePrimary = vi.fn()
		const closeFallback = vi.fn()
		openUploadedSourceMock.mockResolvedValue({
			backend: 'opfs',
			sourceAvailable: true,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
			db: { close: closePrimary } as unknown as Database,
		})
		openSnapshotSourceMock.mockResolvedValue({
			backend: 'snapshot',
			sourceAvailable: false,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
			},
			db: { close: closeFallback } as unknown as Database,
		})
		rebuildSnapshotFromDatabaseMock
			.mockRejectedValueOnce(
				new Error(
					'SQLITE_CANTOPEN: sqlite3 result code 14: unable to open database file'
				)
			)
			.mockResolvedValueOnce({
				transactionCount: 7,
				syncObjectRows: 20,
			})

		const result = await handleUpload(new File(['db'], 'report.sqlite'))

		expect(clearSourceByBackendMock).toHaveBeenCalledWith('opfs')
		expect(openSnapshotSourceMock).toHaveBeenCalledTimes(1)
		expect(rebuildSnapshotFromDatabaseMock).toHaveBeenCalledTimes(2)
		expect(writeSessionSnapshotManifestMock).toHaveBeenCalledWith({
			backend: 'snapshot',
			sourceAvailable: false,
			source: expect.objectContaining({ fileName: 'report.sqlite' }),
			transactionCount: 7,
		})
		expect(closePrimary).toHaveBeenCalledTimes(1)
		expect(closeFallback).toHaveBeenCalledTimes(1)
		expect(result.backend).toBe('snapshot')
		expect(result.transactionCount).toBe(7)
	})

	it('always closes db when rebuild fails', async () => {
		const close = vi.fn()
		openUploadedSourceMock.mockResolvedValue({
			backend: 'snapshot',
			sourceAvailable: false,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
			},
			db: { close } as unknown as Database,
		})
		rebuildSnapshotFromDatabaseMock.mockRejectedValue(new Error('failed'))

		await expect(
			handleUpload(new File(['db'], 'report.sqlite'))
		).rejects.toThrow('failed')
		expect(close).toHaveBeenCalledTimes(1)
		expect(openSnapshotSourceMock).not.toHaveBeenCalled()
	})
})
