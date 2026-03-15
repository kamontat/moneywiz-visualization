import { vi } from 'vitest'

export class MemoryStorage implements Storage {
	private store: Map<string, string> = new Map()

	get length(): number {
		return this.store.size
	}

	clear(): void {
		this.store.clear()
	}

	getItem(key: string): string | null {
		return this.store.get(key) ?? null
	}

	setItem(key: string, value: string): void {
		this.store.set(key, value)
	}

	removeItem(key: string): void {
		this.store.delete(key)
	}

	key(index: number): string | null {
		const keys = Array.from(this.store.keys())
		return keys[index] ?? null
	}
}

export function createMockIndexDB() {
	return {
		open: vi.fn().mockResolvedValue({
			get: vi.fn().mockResolvedValue(undefined),
			put: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined),
			clear: vi.fn().mockResolvedValue(undefined),
			getAll: vi.fn().mockResolvedValue([]),
			getAllKeys: vi.fn().mockResolvedValue([]),
			transaction: vi.fn().mockResolvedValue({
				store: vi.fn().mockReturnValue({
					get: vi.fn().mockResolvedValue(undefined),
					put: vi.fn().mockResolvedValue(undefined),
					delete: vi.fn().mockResolvedValue(undefined),
				}),
			}),
			close: vi.fn(),
		}),
		deleteDatabase: vi.fn().mockResolvedValue(undefined),
		databases: vi.fn().mockResolvedValue([]),
		cmp: vi.fn().mockReturnValue(0),
	}
}

export function setupTestStorage() {
	return {
		localStorage: new MemoryStorage(),
		sessionStorage: new MemoryStorage(),
	}
}

export function teardownTestStorage(
	storage: ReturnType<typeof setupTestStorage>
) {
	storage.localStorage.clear()
	storage.sessionStorage.clear()
}
