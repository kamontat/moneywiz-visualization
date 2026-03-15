import type { Versionable } from '$lib/types'

export class AStorageProvider<
	N extends string,
	V extends number,
> implements Versionable<N, V> {
	constructor(
		readonly name: N,
		readonly version: V,
		private readonly storage: Storage
	) {}

	has(key: string): boolean {
		return this.storage.getItem(key) !== null
	}

	get<T>(key: string): T | undefined {
		const raw = this.storage.getItem(key)
		if (raw === null) return undefined
		try {
			return JSON.parse(raw) as T
		} catch {
			return undefined
		}
	}

	set<T>(key: string, value: T): void {
		this.storage.setItem(key, JSON.stringify(value))
	}

	delete(key: string): void {
		this.storage.removeItem(key)
	}

	clear(): void {
		this.storage.clear()
	}

	keys(): string[] {
		const result: string[] = []
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i)
			if (key !== null) result.push(key)
		}
		return result
	}
}

function setupAStorageProvider<N extends string>(
	name: N,
	storageAccessor: (w: typeof globalThis) => Storage
): AStorageProvider<N, 1> {
	const storage = storageAccessor(globalThis)
	return new AStorageProvider(name, 1, storage)
}

export const lstorage = /* @__PURE__ */ setupAStorageProvider(
	'localStorage',
	(w) => w.localStorage
)

export const sstorage = /* @__PURE__ */ setupAStorageProvider(
	'sessionStorage',
	(w) => w.sessionStorage
)
