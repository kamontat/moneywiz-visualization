import type { Writable } from 'svelte/store'
import type { StoreSchema } from './schema'
import type { Log } from '$lib/loggers/models'
import type { AnyDatabase } from '$utils/db/models'
import type { PromiseOrVal } from '$utils/types'

/** Get value from database */
export type StorageGetFn<DB extends AnyDatabase<StoreSchema>, O> = (
	database: DB
) => PromiseOrVal<O | null | undefined>

/** Set value to database */
export type StorageSetFn<DB extends AnyDatabase<StoreSchema>, O> = (
	database: DB,
	value: O
) => PromiseOrVal<void>

/** Delete value from database */
export type StorageDelFn<DB extends AnyDatabase<StoreSchema>> = (
	database: DB
) => PromiseOrVal<void>

export type StoreSubscribeFn<O> = Writable<O>['subscribe']

export type StoreSetFn<O> = Writable<O>['set']
export type StoreSetAsyncFn<O> = (
	...args: Parameters<StoreSetFn<O>>
) => Promise<ReturnType<StoreSetFn<O>>>

export type StoreUpdateFn<O> = Writable<O>['update']
export type StoreUpdateAsyncFn<O> = (
	...args: Parameters<StoreUpdateFn<O>>
) => Promise<ReturnType<StoreUpdateFn<O>>>

export type StoreResetFn = () => void
export type StoreResetAsyncFn = () => Promise<void>

export type StoreContext<DB extends AnyDatabase<StoreSchema>, O> = {
	/** Get state */
	get: StorageGetFn<DB, O>
	/** Set state */
	set: StorageSetFn<DB, O>
	/** Delete state */
	del: StorageDelFn<DB>
	log: Log<string, string>
}

export interface Store<O> {
	subscribe: StoreSubscribeFn<O>
	set: StoreSetFn<O>
	setAsync: StoreSetAsyncFn<O>
	update: StoreUpdateFn<O>
	updateAsync: StoreUpdateAsyncFn<O>
	reset: StoreResetFn
	resetAsync: StoreResetAsyncFn
}
