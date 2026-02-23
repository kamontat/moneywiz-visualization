import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	uploadSQLiteSourceMock,
	bootstrapSQLiteSourceMock,
	clearSQLiteSourceMock,
	getSQLiteSourceStatusMock,
} = vi.hoisted(() => ({
	uploadSQLiteSourceMock: vi.fn(),
	bootstrapSQLiteSourceMock: vi.fn(),
	clearSQLiteSourceMock: vi.fn(),
	getSQLiteSourceStatusMock: vi.fn(),
}))

vi.mock('$lib/source/sqlite', () => ({
	uploadSQLiteSource: uploadSQLiteSourceMock,
	bootstrapSQLiteSource: bootstrapSQLiteSourceMock,
	clearSQLiteSource: clearSQLiteSourceMock,
	getSQLiteSourceStatus: getSQLiteSourceStatusMock,
}))

import { bootstrapSession } from './bootstrap'
import { clearSessionData } from './clear'
import { refreshSessionStatus } from './status'
import { uploadSessionFile } from './upload'

import { createSessionStore } from '$lib/session/store'

describe('session workflow integration', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('upload flow persists ready state for snapshot backend', async () => {
		const store = createSessionStore()
		uploadSQLiteSourceMock.mockResolvedValue({
			backend: 'snapshot',
			sourceAvailable: false,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
			},
			transactionCount: 12,
		})

		const count = await uploadSessionFile(
			store,
			new File(['db'], 'report.sqlite')
		)
		const state = get(store)

		expect(count).toBe(12)
		expect(state.status).toBe('ready')
		expect(state.backend).toBe('snapshot')
		expect(state.lastLoadedFrom).toBe('upload')
	})

	it('bootstrap flow returns idle when snapshot is unavailable', async () => {
		const store = createSessionStore()
		bootstrapSQLiteSourceMock.mockResolvedValue({
			ready: false,
			rebuilt: false,
			backend: 'snapshot',
			sourceAvailable: false,
			transactionCount: 0,
			reason: 'snapshot_unavailable',
		})

		await bootstrapSession(store)
		const state = get(store)

		expect(state.status).toBe('idle')
		expect(state.lastError).toBe('snapshot_unavailable')
	})

	it('bootstrap flow marks lastLoadedFrom as rebuild when rebuilt', async () => {
		const store = createSessionStore()
		bootstrapSQLiteSourceMock.mockResolvedValue({
			ready: true,
			rebuilt: true,
			backend: 'opfs',
			sourceAvailable: true,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
			transactionCount: 44,
		})

		await bootstrapSession(store)
		const state = get(store)

		expect(state.status).toBe('ready')
		expect(state.lastLoadedFrom).toBe('rebuild')
		expect(state.transactionCount).toBe(44)
	})

	it('clear flow resets store', async () => {
		const store = createSessionStore()
		uploadSQLiteSourceMock.mockResolvedValue({
			backend: 'snapshot',
			sourceAvailable: false,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
			},
			transactionCount: 3,
		})
		clearSQLiteSourceMock.mockResolvedValue({ cleared: true })

		await uploadSessionFile(store, new File(['db'], 'report.sqlite'))
		await clearSessionData(store)
		const state = get(store)

		expect(state.status).toBe('idle')
		expect(state.source).toBeUndefined()
	})

	it('status flow refreshes from snapshot status', async () => {
		const store = createSessionStore()
		getSQLiteSourceStatusMock.mockResolvedValue({
			backend: 'opfs',
			sourceAvailable: true,
			snapshotValid: true,
			transactionCount: 20,
			source: {
				fileName: 'report.sqlite',
				size: 100,
				modifiedAt: 1,
				uploadedAt: '2026-01-01T00:00:00.000Z',
				sourcePath: '/moneywiz/current.sqlite3',
			},
		})

		await refreshSessionStatus(store)
		const state = get(store)

		expect(state.status).toBe('ready')
		expect(state.lastLoadedFrom).toBe('snapshot')
		expect(state.transactionCount).toBe(20)
	})
})
