/** Check state value equality */
export type StateEqualFn<S> = (a: S, b: S) => boolean
/** Update state value */
export type StateUpdateFn<S> = (current: S) => S
/** Merge state value together */
export type StateMergeFn<S> = (base: S, partial: Partial<S>) => S
/** Normalize state value */
export type StateNormalizeFn<S> = (value: S | Partial<S>) => S
