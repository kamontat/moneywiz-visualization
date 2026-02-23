import type { Database } from '@sqlite.org/sqlite-wasm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	getSqlite3Mock,
	supportsOpfsBackendMock,
	importFileToOpfsMock,
	openOpfsDatabaseMock,
	opfsSourceExistsMock,
	clearOpfsSourceMock,
	openSnapshotDatabaseMock,
} = vi.hoisted(() => ({
	getSqlite3Mock: vi.fn(),
	supportsOpfsBackendMock: vi.fn(),
	importFileToOpfsMock: vi.fn(),
	openOpfsDatabaseMock: vi.fn(),
	opfsSourceExistsMock: vi.fn(),
	clearOpfsSourceMock: vi.fn(),
	openSnapshotDatabaseMock: vi.fn(),
}))

vi.mock('$lib/source/sqlite/worker/runtime', () => ({
	getSqlite3: getSqlite3Mock,
}))

vi.mock('./opfs-backend', () => ({
	supportsOpfsBackend: supportsOpfsBackendMock,
	importFileToOpfs: importFileToOpfsMock,
	openOpfsDatabase: openOpfsDatabaseMock,
	opfsSourceExists: opfsSourceExistsMock,
	clearOpfsSource: clearOpfsSourceMock,
	OPFS_SOURCE_PATH: '/moneywiz/current.sqlite3',
}))

vi.mock('./snapshot-backend', () => ({
	openSnapshotDatabase: openSnapshotDatabaseMock,
}))

import {
	clearSourceByBackend,
	isSourceAvailable,
	openExistingOpfsSource,
	openUploadedSource,
} from './backend-factory'

describe('backend-factory integration', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		getSqlite3Mock.mockResolvedValue({ oo1: { OpfsDb: {} } })
	})

	it('uses opfs backend when supported', async () => {
		const db = { close: vi.fn() } as unknown as Database
		supportsOpfsBackendMock.mockReturnValue(true)
		openOpfsDatabaseMock.mockReturnValue(db)

		const result = await openUploadedSource(new File(['db'], 'report.sqlite'))

		expect(importFileToOpfsMock).toHaveBeenCalledTimes(1)
		expect(result.backend).toBe('opfs')
		expect(result.sourceAvailable).toBe(true)
		expect(result.source.sourcePath).toBe('/moneywiz/current.sqlite3')
		expect(result.db).toBe(db)
	})

	it('falls back to snapshot backend when opfs is unsupported', async () => {
		const db = { close: vi.fn() } as unknown as Database
		supportsOpfsBackendMock.mockReturnValue(false)
		openSnapshotDatabaseMock.mockResolvedValue(db)

		const result = await openUploadedSource(new File(['db'], 'report.sqlite'))

		expect(openSnapshotDatabaseMock).toHaveBeenCalledTimes(1)
		expect(result.backend).toBe('snapshot')
		expect(result.sourceAvailable).toBe(false)
		expect(result.db).toBe(db)
	})

	it('falls back to snapshot backend when opfs open fails', async () => {
		const db = { close: vi.fn() } as unknown as Database
		supportsOpfsBackendMock.mockReturnValue(true)
		openOpfsDatabaseMock.mockImplementation(() => {
			throw new Error(
				'SQLITE_CANTOPEN: sqlite3 result code 14: unable to open database file'
			)
		})
		openSnapshotDatabaseMock.mockResolvedValue(db)

		const result = await openUploadedSource(new File(['db'], 'report.sqlite'))

		expect(importFileToOpfsMock).toHaveBeenCalledTimes(1)
		expect(openSnapshotDatabaseMock).toHaveBeenCalledTimes(1)
		expect(result.backend).toBe('snapshot')
		expect(result.sourceAvailable).toBe(false)
		expect(result.db).toBe(db)
	})

	it('reports source availability and clear behavior for opfs backend', async () => {
		opfsSourceExistsMock.mockResolvedValue(true)

		await expect(isSourceAvailable('opfs')).resolves.toBe(true)
		await clearSourceByBackend('opfs')

		expect(clearOpfsSourceMock).toHaveBeenCalledTimes(1)
	})

	it('opens existing opfs source only when available', async () => {
		const db = { close: vi.fn() } as unknown as Database
		supportsOpfsBackendMock.mockReturnValue(true)
		opfsSourceExistsMock.mockResolvedValue(true)
		openOpfsDatabaseMock.mockReturnValue(db)

		const result = await openExistingOpfsSource()

		expect(result).toBe(db)
	})

	it('returns undefined when existing opfs source cannot be opened', async () => {
		supportsOpfsBackendMock.mockReturnValue(true)
		opfsSourceExistsMock.mockResolvedValue(true)
		openOpfsDatabaseMock.mockImplementation(() => {
			throw new Error(
				'SQLITE_CANTOPEN: sqlite3 result code 14: unable to open database file'
			)
		})

		const result = await openExistingOpfsSource()

		expect(result).toBeUndefined()
	})
})
