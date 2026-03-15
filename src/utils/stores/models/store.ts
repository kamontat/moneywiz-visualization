import type { Writable } from 'svelte/store'
import type { Log } from '$lib/loggers/models'
import type { PromiseOrVal } from '$utils/types'

export type StoreContext<O> = {
	available: () => boolean
	get: () => PromiseOrVal<O | null | undefined>
	set: (value: O) => PromiseOrVal<void>
	del: () => PromiseOrVal<void>
	log: Log<string, string>
}

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

export interface Store<O> {
	subscribe: StoreSubscribeFn<O>
	set: StoreSetFn<O>
	setAsync: StoreSetAsyncFn<O>
	update: StoreUpdateFn<O>
	updateAsync: StoreUpdateAsyncFn<O>
	reset: StoreResetFn
	resetAsync: StoreResetAsyncFn
}
