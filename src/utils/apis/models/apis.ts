import type { AnyRecord } from '$utils/types'

export interface BaseAPIs<N extends string, V extends number> {
	readonly name: N
	readonly version: V
}

export type APIs<
	N extends string,
	V extends number,
	M extends AnyRecord,
> = BaseAPIs<N, V> & M
