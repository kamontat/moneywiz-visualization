/** Predicate-based filter: returns a subset of the input array */
export type FilterFn<I> = (input: I[]) => I[]

export type FilterMode = 'include' | 'exclude'

export interface TagFilter {
	readonly category: string
	readonly values: readonly string[]
	readonly mode: FilterMode
}

/** Mapping function: transforms an array of I into an array of O */
export type MapFn<I, O> = (input: I[]) => O[]

/** Reducing function: folds an array of I into a single O */
export type ReduceFn<I, O> = (init: O, input: I[]) => O
