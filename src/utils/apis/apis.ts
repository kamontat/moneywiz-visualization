import type { APIs } from './models'
import type { AnyRecord } from '$utils/types'

export const newAPIs = <
	N extends string,
	V extends number,
	M extends AnyRecord,
>(
	name: N,
	version: V,
	methods: M
): APIs<N, V, M> => {
	return Object.assign({ name, version }, methods)
}
