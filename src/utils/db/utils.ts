import type { DatabaseRaw, DBFullName, DBName, DBVersion } from './models'

export const emptyDB = <D extends DatabaseRaw<DBFullName>>() => {
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
	const _name = raw[1] as DBName<N>
	const _version = parseVersion(raw[0]) as DBVersion<N>
	return [_name, _version] as const
}
