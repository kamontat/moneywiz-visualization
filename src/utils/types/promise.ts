export type PromiseOrVal<T> = T | Promise<T>

export type WithPromiseLike<
	IsPromise extends boolean,
	T,
> = IsPromise extends true ? Promise<T> : T
