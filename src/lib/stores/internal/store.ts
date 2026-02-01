import type { DBFullName } from './models'
import type { AnyTriggerData, DB } from '$lib/db/models'
import type { Log } from '$lib/loggers/models'
import type { AnyRecord, DeepPartial } from '$lib/types'
import { writable, type Writable } from 'svelte/store'

import { mergeState } from './state'

export type StateGet<D extends DB<DBFullName>, S> = (
	db: D
) => Promise<S | undefined | null> | S | undefined | null
export type StateSet<D extends DB<DBFullName>, S> = (
	db: D,
	value: S
) => Promise<void> | void
export type StateDel<D extends DB<DBFullName>> = (db: D) => Promise<void> | void
export type StateNormal<S> = (value: S) => S

export type StateOnChange<D extends DB<DBFullName>, S> = (
	store: Store<S>,
	db: D,
	data: AnyTriggerData<S> | undefined,
	event: StorageEvent
) => void

export interface StoreContext<D extends DB<DBFullName>, S extends AnyRecord> {
	getVal: StateGet<D, S>
	setVal: StateSet<D, S>
	delVal: StateDel<D>
	normalize?: StateNormal<S>
	onChange?: StateOnChange<D, S>
	log: Log<string, string>
}

export type StoreMerger<S> = (partial: DeepPartial<S>) => void
export type StoreReset = () => void

export interface Store<S> extends Writable<S> {
	merge: StoreMerger<S>
	reset: StoreReset
}

export const newStore = async <D extends DB<DBFullName>, S extends AnyRecord>(
	db: D,
	empty: S,
	{ getVal, setVal, delVal, normalize, onChange, log }: StoreContext<D, S>
): Promise<Store<S>> => {
	let base = empty
	if (db.available()) {
		const val = await getVal(db)
		if (val) base = val
	}

	const {
		subscribe: _subscribe,
		set: _set,
		update: _update,
	} = writable<S>(base, () => {
		log.debug('got a subscriber')
		return () => log.debug('no more subscribers')
	})

	const subscribe: Writable<S>['subscribe'] = (run, invalidate) => {
		log.debug('subscribing to store')
		return _subscribe(run, invalidate)
	}

	const set: Writable<S>['set'] = (value) => {
		const next = normalize?.(value) ?? value

		Promise.resolve(setVal(db, next))
			.then(() => log.debug('store persisted'))
			.catch((err) => log.warn('failed to persist store', err))
		return _set(next)
	}

	const update: Writable<S>['update'] = (updater) => {
		return _update((current) => {
			const next = normalize?.(updater(current)) ?? updater(current)
			if (next !== current) {
				Promise.resolve(setVal(db, next))
					.then(() => log.debug('store persisted'))
					.catch((err) => log.warn('failed to persist store', err))
			}
			return next
		})
	}

	const merge: StoreMerger<S> = (partial: DeepPartial<S>) => {
		update((current) => mergeState(current, partial, 1, false))
	}

	const reset: StoreReset = () => {
		log.debug('resetting store')
		Promise.resolve(delVal(db))
			.then(() => log.debug('store persisted'))
			.catch((err) => log.warn('failed to persist store', err))
		_set(empty)
	}

	const store = { subscribe, set, update, merge, reset }

	if (db.available() && onChange) {
		db.onChange((event, data) => {
			onChange(store, db, data, event)
		})
	}

	return store
}
