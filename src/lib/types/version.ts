export interface Versionable<N extends string, V extends number> {
	readonly name: N
	readonly version: V
}
