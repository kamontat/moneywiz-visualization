import type {
	Store,
	StoreContext,
	StoreResetAsyncFn,
	StoreResetFn,
	StoreSetAsyncFn,
	StoreSetFn,
	StoreSubscribeFn,
	StoreUpdateAsyncFn,
	StoreUpdateFn,
} from './models'
import type { AnyState, StateValue } from '$utils/states/models'
import { writable } from 'svelte/store'

export const newStore = <S extends AnyState>(
	state: S,
	ctx: StoreContext<StateValue<S>>
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
			await Promise.resolve(ctx.set(next))
			ctx.log.debug('persist state')
		} catch (err) {
			ctx.log.warn('failed to persist state:', err)
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
					Promise.resolve(ctx.set(next))
						.then(() => {
							ctx.log.debug('persist state')
							res()
						})
						.catch((err) => {
							ctx.log.warn('failed to persist state:', err)
							rej(err)
						})
				} else {
					res()
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
		await ctx.del()
		return _set(state.empty)
	}

	const reset: StoreResetFn = () => {
		resetAsync()
	}

	// Load initial value from storage
	if (ctx.available()) {
		Promise.resolve(ctx.get()).then((val) => {
			if (val !== null && val !== undefined) {
				ctx.log.debug('set initiate value from storage')
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
