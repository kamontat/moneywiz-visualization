import type { DBSchema } from 'idb'

export type DBFullName = `v${number}:${string}`
export type DBIndexKeys = NonNullable<DBSchema[string]['indexes']>

export type DBName<F extends DBFullName> =
	F extends `v${number}:${infer N extends string}` ? N : never
export type DBVersion<F extends DBFullName> =
	F extends `v${infer V extends number}:${string}` ? V : never
