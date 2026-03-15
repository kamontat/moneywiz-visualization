import type { Versionable } from '$lib/types'
import { browser } from '$app/environment'

export interface LocalStorageTable<T extends string> {
	readonly table: T

	get<R>(key: string): R | undefined
	set<R>(key: string, value: R): void
	delete(key: string): void
	clear(): void
	keys(): string[]

	onChange<R>(key: string, callback: (value: R | undefined) => void): void
}

class LocalStorageTableImpl<T extends string> implements LocalStorageTable<T> {
	constructor(readonly table: T) {}

	private fullKey(key: string): string {
		return `${this.table}:${key}`
	}

	get<R>(key: string): R | undefined {
		const raw = localStorage.getItem(this.fullKey(key))
		if (raw === null) return undefined
		try {
			return JSON.parse(raw) as R
		} catch {
			return undefined
		}
	}

	set<R>(key: string, value: R): void {
		localStorage.setItem(this.fullKey(key), JSON.stringify(value))
	}

	delete(key: string): void {
		localStorage.removeItem(this.fullKey(key))
	}

	clear(): void {
		const prefix = `${this.table}:`
		const toRemove: string[] = []
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i)
			if (k?.startsWith(prefix)) toRemove.push(k)
		}
		toRemove.forEach((k) => localStorage.removeItem(k))
	}

	keys(): string[] {
		const prefix = `${this.table}:`
		const result: string[] = []
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i)
			if (k?.startsWith(prefix)) result.push(k.slice(prefix.length))
		}
		return result
	}

	onChange<R>(key: string, callback: (value: R | undefined) => void): void {
		const fullKey = this.fullKey(key)
		window.addEventListener('storage', (event) => {
			if (event.key !== fullKey) return
			if (event.newValue === null) {
				callback(undefined)
				return
			}
			try {
				callback(JSON.parse(event.newValue) as R)
			} catch {
				callback(undefined)
			}
		})
	}
}

export class LocalStorageProvider implements Versionable<'localstorage', 1> {
	readonly name = 'localstorage' as const
	readonly version = 1 as const

	private readonly tables = new Map<string, LocalStorageTable<string>>()

	available(): boolean {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined'
		)
	}

	table<T extends string>(name: T): LocalStorageTable<T> {
		if (!this.tables.has(name)) {
			this.tables.set(name, new LocalStorageTableImpl(name))
		}
		return this.tables.get(name)! as LocalStorageTable<T>
	}
}

export const localstorage = /* @__PURE__ */ new LocalStorageProvider()
