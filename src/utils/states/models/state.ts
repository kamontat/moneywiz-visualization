import type {
	StateEqualFn,
	StateMergeFn,
	StateNormalizeFn,
	StateUpdateFn,
} from './functions'

export interface State<S> {
	empty: S
	equal: StateEqualFn<S>
	update: StateUpdateFn<S>
	merge: StateMergeFn<S>
	normalize: StateNormalizeFn<S>
}

export type StateValue<S> = S extends State<infer V> ? V : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyState = State<any>
