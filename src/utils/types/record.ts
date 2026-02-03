// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>

/** Deep partial type */
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>
		}
	: T

/** Convert input to object */
export type ToObj<T> = T extends AnyRecord
	? {
			[K in keyof T]: T[K]
		}
	: never

/** Get object key as string */
export type ToKey<S, K extends keyof S | undefined = undefined> = (
	K extends keyof S ? keyof S[K] : keyof S
) extends infer R
	? R extends string
		? R
		: never
	: never
