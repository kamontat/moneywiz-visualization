import type { AnyRecord } from './record'

type KeyVal<K extends string, V> = { key: K; value: V }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyKeyVal = KeyVal<string, any>

export type ToKVs<T> = T extends [infer F, ...infer R]
	? F extends KeyVal<infer K, infer V>
		? R extends []
			? Record<K, V>
			: Record<K, V> & ToKVs<R>
		: never
	: AnyRecord
