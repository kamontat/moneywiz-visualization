import type { DB } from './models'
import type { DBFullName, DBName, DBVersion } from '$lib/stores/internal'

export const emptyDB = <D extends DB<DBFullName>>() => {
	return {
		name: 'v0:empty-db' as DBFullName,
		available: () => false,
	} as D
}

const parseVersion = (v: string) => {
	const version = parseInt(v.slice(1), 10)
	if (isNaN(version) || version < 1) return 1
	else return version
}

export const parseDBFullName = <N extends DBFullName>(name: N) => {
	const raw = name.split(':', 2)
	return [raw[1] as DBName<N>, parseVersion(raw[0]) as DBVersion<N>] as const
}
