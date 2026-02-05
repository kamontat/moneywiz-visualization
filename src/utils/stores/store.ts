import type {
	Store,
	StoreContext,
	StoreResetAsyncFn,
	StoreResetFn,
	StoreSchema,
	StoreSetAsyncFn,
	StoreSetFn,
	StoreSubscribeFn,
	StoreUpdateAsyncFn,
	StoreUpdateFn,
} from './models'
import type { Database } from '$utils/db/models'
import type { AnyState, StateValue } from '$utils/states/models'
import type { ToKey } from '$utils/types'
import { writable } from 'svelte/store'

export const newStore = <
	Name extends ToKey<StoreSchema>,
	DB extends Database<Name, StoreSchema[Name]>,
	S extends AnyState,
>(
	db: DB,
	state: S,
	ctx: StoreContext<DB, StateValue<S>>
): Store<StateValue<S>> => {
	const {
		set: _set,
		update: _update,
		subscribe: _subscribe,
	} = writable(state.empty, () => {
		ctx.log.debug('got a subscriber')
		return () => ctx.log.debug('no more subscribers')
	})

	const subscribe: StoreSubscribeFn<StateValue<S>> = (run, invalidate) => {
		ctx.log.debug('subscribing to store')
		return _subscribe(run, invalidate)
	}

	const setAsync: StoreSetAsyncFn<StateValue<S>> = async (value) => {
		const next = state.normalize(value)

		try {
			await Promise.resolve(ctx.set(db, next))
			ctx.log.debug('persist state on %s', db.type)
		} catch (err) {
			ctx.log.warn('failed to persist state on %s:', db.type, err)
		}
		return _set(next)
	}

	const set: StoreSetFn<StateValue<S>> = (value) => {
		setAsync(value)
	}

	const updateAsync: StoreUpdateAsyncFn<StateValue<S>> = async (updater) => {
		return new Promise((res, rej) => {
			_update((current) => {
				const next = state.normalize(updater(current))
				if (!state.equal(next, current)) {
					Promise.resolve(ctx.set(db, next))
						.then(() => {
							ctx.log.debug('persist state on %s', db.type)
							res()
						})
						.catch((err) => {
							ctx.log.warn('failed to persist state on %s:', db.type, err)
							rej(err)
						})
				}
				return next
			})
		})
	}

	const update: StoreUpdateFn<StateValue<S>> = (updater) => {
		updateAsync(updater)
	}

	const resetAsync: StoreResetAsyncFn = async () => {
		ctx.log.debug('resetting store')
		await ctx.del(db)
		return _set(state.empty)
	}

	const reset: StoreResetFn = () => {
		resetAsync()
	}

	// Load initial value from database
	if (db.available()) {
		Promise.resolve(ctx.get(db)).then((val) => {
			if (val !== null && val !== undefined) {
				ctx.log.debug('set initiate value from database')
				_set(val)
			}
		})
	}

	return {
		subscribe,
		set,
		setAsync,
		update,
		updateAsync,
		reset,
		resetAsync,
	}
}
