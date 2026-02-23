import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSnapshotStatusMock, isSourceAvailableMock } = vi.hoisted(() => ({
	getSnapshotStatusMock: vi.fn(),
	isSourceAvailableMock: vi.fn(),
}))

vi.mock('$lib/ledger/repository', () => ({
	getSnapshotStatus: getSnapshotStatusMock,
}))

vi.mock('$lib/source/sqlite/worker/backends', () => ({
	isSourceAvailable: isSourceAvailableMock,
}))

import { handleStatus } from './status'

describe('handleStatus', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('reports snapshot and source status', async () => {
		getSnapshotStatusMock.mockResolvedValue({
			valid: true,
			transactionCount: 30,
			manifest: {
				backend: 'opfs',
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

		const result = await handleStatus()

		expect(result).toEqual({
			backend: 'opfs',
			sourceAvailable: true,
			snapshotValid: true,
			transactionCount: 30,
			source: expect.objectContaining({ fileName: 'report.sqlite' }),
		})
	})
})
