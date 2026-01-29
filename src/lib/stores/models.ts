import type { Writable } from 'svelte/store'

export interface StoreState<K extends string, D> {
	type: K
	data: D
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStoreStateData<K extends string> = StoreState<K, any>
export type AnyStoreState = AnyStoreStateData<string>

export type StoreUpdater<S extends AnyStoreState> = (value: S) => S

export interface StoreFactory<S extends AnyStoreState> {
	emptyState: S
	normalize: (value: Partial<S> | undefined | null) => S
}

export interface Store<S extends AnyStoreState> extends Writable<S> {
	key: S['type']
	reset: () => void
}
