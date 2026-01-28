import type { ParsedCsv } from '$lib/csv'
import type { ParsedTransaction } from '$lib/transactions'
import type { Readable, Writable } from 'svelte/store'
import type { STORE_STATE_CSV_KEY, STORE_STATE_FILTER_KEY, STORE_STATE_TRX_KEY } from './constants'

export interface StoreState<K extends string, D> {
	type: K
	data: D
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStoreStateData<K extends string> = StoreState<K, any>
export type AnyStoreState = AnyStoreStateData<string>

export interface StoreStateCsv extends StoreState<typeof STORE_STATE_CSV_KEY, ParsedCsv> {
	fileName: string | null
}

export interface StoreStateTrx extends StoreState<typeof STORE_STATE_TRX_KEY, ParsedTransaction[]> {
	fileName: string | null
}

// TODO: Implement filter object structure
export type StoreStateFilter = StoreState<typeof STORE_STATE_FILTER_KEY, unknown>

export type StoreUpdater<S> = (value: S) => S

export interface StoreFactory<S extends AnyStoreState> {
	emptyState: (key: S['type']) => S
	normalize: StoreUpdater<S>
}

export interface Store<S extends AnyStoreState> extends Writable<S> {
	key: S['type']
	reset: () => void
}
