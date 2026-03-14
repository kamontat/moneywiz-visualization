import type { SqliteApiV1 } from '$lib/apis/sqlite/index.js'
import { get, writable } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSessionController } from './sessionController.js'

import { createWorkerClient } from '$lib/apis/sqlite/index.js'
import { createSessionStore } from '$lib/app/sessions/store.js'

// Mock the apis/sqlite module
vi.mock('$lib/apis/sqlite/index.js', () => ({
	createWorkerClient: vi.fn(),
}))

const mockClient: Record<string, ReturnType<typeof vi.fn>> = {
	bootstrap: vi.fn(),
	upload: vi.fn(),
	clear: vi.fn(),
	status: vi.fn(),
	query: vi.fn(),
	terminate: vi.fn(),
}

vi.mocked(createWorkerClient).mockReturnValue({
	name: 'sqlite',
	version: 1,
	...mockClient,
} as unknown as SqliteApiV1)

describe('SessionController', () => {
	const store = createSessionStore()
	const uploading = writable(false)
	const ctrl = createSessionController(store, uploading)

	beforeEach(() => {
		store.reset()
		uploading.set(false)
		vi.clearAllMocks()
		vi.mocked(createWorkerClient).mockReturnValue({
			name: 'sqlite',
			version: 1,
			...mockClient,
		} as unknown as SqliteApiV1)
	})

	describe('bootstrap', () => {
		it('transitions to loading then ready on success', async () => {
			mockClient.bootstrap.mockResolvedValue({
				mode: 'reused',
				status: 'passed',
				message: 'ok',
				duration: 100,
				transactionCount: 42,
				sourceAvailable: true,
				source: {
					fileName: 'test.sqlite',
					size: 1024,
					modifiedAt: Date.now(),
					uploadedAt: new Date().toISOString(),
				},
			})

			await ctrl.bootstrap()

			const state = get(store)
			expect(state.status).toBe('ready')
			expect(state.transactionCount).toBe(42)
			expect(state.lastLoadedFrom).toBe('snapshot')
		})

		it('transitions to idle when missed', async () => {
			mockClient.bootstrap.mockResolvedValue({
				mode: 'missed',
				status: 'missed',
				message: 'no snapshot',
				duration: 10,
				sourceAvailable: false,
				transactionCount: 0,
			})

			await ctrl.bootstrap()

			const state = get(store)
			expect(state.status).toBe('idle')
		})

		it('marks rebuilt when mode is rebuilt', async () => {
			mockClient.bootstrap.mockResolvedValue({
				mode: 'rebuilt',
				status: 'passed',
				message: 'rebuilt',
				duration: 200,
				transactionCount: 10,
				sourceAvailable: true,
			})

			await ctrl.bootstrap()
			expect(get(store).lastLoadedFrom).toBe('rebuild')
		})

		it('transitions to error on exception', async () => {
			mockClient.bootstrap.mockRejectedValue(new Error('worker crashed'))

			await ctrl.bootstrap()

			const state = get(store)
			expect(state.status).toBe('error')
			expect(state.lastError).toBe('worker crashed')
		})
	})

	describe('upload', () => {
		it('sets uploading and transitions to ready', async () => {
			mockClient.upload.mockResolvedValue({
				status: 'passed',
				message: 'ok',
				duration: 150,
				transactionCount: 100,
				sourceAvailable: true,
				source: {
					fileName: 'test.sqlite',
					size: 2048,
					modifiedAt: Date.now(),
					uploadedAt: new Date().toISOString(),
				},
			})

			const file = new File(['data'], 'test.sqlite')
			const count = await ctrl.upload(file)

			expect(count).toBe(100)
			expect(get(store).status).toBe('ready')
			expect(get(store).lastLoadedFrom).toBe('upload')
			expect(get(uploading)).toBe(false)
		})

		it('handles upload failure', async () => {
			mockClient.upload.mockRejectedValue(new Error('upload failed'))

			const file = new File(['data'], 'test.sqlite')
			const count = await ctrl.upload(file)

			expect(count).toBe(0)
			expect(get(store).status).toBe('error')
			expect(get(store).lastError).toBe('upload failed')
			expect(get(uploading)).toBe(false)
		})
	})

	describe('clear', () => {
		it('resets store on success', async () => {
			store.set({
				status: 'ready',
				transactionCount: 50,
				backend: 'opfs',
			})
			mockClient.clear.mockResolvedValue(true)

			await ctrl.clear()

			expect(get(store).status).toBe('idle')
			expect(get(store).transactionCount).toBe(0)
			expect(get(uploading)).toBe(false)
		})

		it('handles clear failure', async () => {
			mockClient.clear.mockRejectedValue(new Error('clear failed'))

			await ctrl.clear()

			expect(get(store).status).toBe('error')
			expect(get(store).lastError).toBe('clear failed')
			expect(get(uploading)).toBe(false)
		})
	})

	describe('status', () => {
		it('updates store from status check', async () => {
			mockClient.status.mockResolvedValue({
				hasSource: true,
				hasSnapshot: true,
				transactionCount: 25,
				source: {
					fileName: 'test.sqlite',
					size: 1024,
					modifiedAt: Date.now(),
					uploadedAt: new Date().toISOString(),
				},
			})

			await ctrl.status()

			expect(get(store).status).toBe('ready')
			expect(get(store).transactionCount).toBe(25)
		})

		it('sets idle when snapshot invalid', async () => {
			mockClient.status.mockResolvedValue({
				hasSource: false,
				hasSnapshot: false,
				transactionCount: 0,
			})

			await ctrl.status()

			expect(get(store).status).toBe('idle')
			expect(get(store).lastError).toBe('snapshot_unavailable')
		})

		it('handles status check failure', async () => {
			mockClient.status.mockRejectedValue(new Error('status failed'))

			await ctrl.status()

			expect(get(store).status).toBe('error')
			expect(get(store).lastError).toBe('status failed')
		})
	})
})
