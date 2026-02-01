export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>
		}
	: T

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>

type KV<K extends string, V> = { key: K; value: V }

export type ToKVs<T> = T extends [infer F, ...infer R]
	? F extends KV<infer K, infer V>
		? R extends []
			? Record<K, V>
			: Record<K, V> & ToKVs<R>
		: never
	: AnyRecord

export type ToObj<T> = T extends AnyRecord
	? {
			[K in keyof T]: T[K]
		}
	: never

export type ToKey<S, K extends keyof S | undefined = undefined> = (
	K extends keyof S ? keyof S[K] : keyof S
) extends infer R
	? R extends string
		? R
		: never
	: never

export type { ObjKeyArray } from './keys'
