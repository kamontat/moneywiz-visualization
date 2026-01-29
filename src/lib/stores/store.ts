import type { AnyStoreState, Store, StoreFactory, StoreUpdater } from './models'

import { writable, type Readable } from 'svelte/store'
import { store, localStorage } from '$lib/loggers'

const getLocalStorage = <V>(key: string): V | undefined => {
	try {
		localStorage.debug('retrieving from localStorage: %s', key)
		const raw = window.localStorage.getItem(key)
		return JSON.parse(raw ?? '') as V
	} catch {
		localStorage.warn('failed to access localStorage for key: %s', key)
		return undefined
	}
}

const setLocalStorage = <V>(key: string, value: V | undefined): void => {
	try {
		if (value === undefined) {
			localStorage.debug('removing from localStorage: %s', key)
			window.localStorage.removeItem(key)
		} else {
			localStorage.debug('saving to localStorage: %s', key)
			const raw = JSON.stringify(value)
			window.localStorage.setItem(key, raw)
		}
	} catch {
		localStorage.error('failed to access localStorage for key: %s', key)
	}
}

export const createStore = <S extends AnyStoreState>(
	key: S['type'],
	factory: StoreFactory<S>
): Store<S> => {
	const log = store
	let base = factory.emptyState
	if (typeof window !== 'undefined') {
		log.debug('hydrating store from localStorage: %s', key)
		base = factory.normalize({
			...base,
			...getLocalStorage(key),
		})
	}

	const { subscribe, set, update } = writable(base)

	const customSubscribe: Readable<S>['subscribe'] = (run, invalidate) => {
		log.debug('subscribing to store: %s', key)
		return subscribe(run, invalidate)
	}
	const customSet = (value: S) => {
		log.debug('setting store: %s', key)
		const next = factory.normalize(value)
		setLocalStorage(key, next)
		set(next)
	}
	const customUpdate = (updater: StoreUpdater<S>) => {
		return update((current) => {
			log.debug('updating store: %s', key)
			const next = factory.normalize(updater(current))
			setLocalStorage(key, next)
			return next
		})
	}
	const customReset = () => {
		log.debug('resetting store to empty state: %s', key)
		setLocalStorage(key, factory.emptyState)
		set(factory.emptyState)
	}
	return {
		key,
		subscribe: customSubscribe,
		set: customSet,
		update: customUpdate,
		reset: customReset,
	}
}
