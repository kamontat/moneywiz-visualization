import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	clearLedgerMetaMock,
	clearLedgerTransactionsMock,
	clearSessionManifestMock,
	getSessionManifestMock,
	clearSourceByBackendMock,
} = vi.hoisted(() => ({
	clearLedgerMetaMock: vi.fn(),
	clearLedgerTransactionsMock: vi.fn(),
	clearSessionManifestMock: vi.fn(),
	getSessionManifestMock: vi.fn(),
	clearSourceByBackendMock: vi.fn(),
}))

vi.mock('$lib/transactions/repository', () => ({
	clearLedgerMeta: clearLedgerMetaMock,
	clearLedgerTransactions: clearLedgerTransactionsMock,
	clearSessionManifest: clearSessionManifestMock,
	getSessionManifest: getSessionManifestMock,
}))

vi.mock('$lib/source/sqlite/worker/backends', () => ({
	clearSourceByBackend: clearSourceByBackendMock,
}))

import { handleClear } from './clear'

describe('handleClear', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('clears snapshot stores, manifest, and backend source', async () => {
		getSessionManifestMock.mockResolvedValue({ backend: 'opfs' })

		const result = await handleClear()

		expect(clearLedgerTransactionsMock).toHaveBeenCalledTimes(1)
		expect(clearLedgerMetaMock).toHaveBeenCalledTimes(1)
		expect(clearSessionManifestMock).toHaveBeenCalledTimes(1)
		expect(clearSourceByBackendMock).toHaveBeenCalledWith('opfs')
		expect(result).toEqual({ cleared: true })
	})
})
