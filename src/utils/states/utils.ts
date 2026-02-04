import type { AnyRecord, DeepPartial } from '$utils/types'

export const copyState = <S extends AnyRecord>(obj: S): S => {
	return structuredClone(obj)
}

export const mergeState = <S extends AnyRecord>(
	base: S,
	option: DeepPartial<S>,
	level: number | undefined = undefined,
	copy = true
): S => {
	if (typeof level === 'number' && level <= 0) return base
	const nextLevel = typeof level === 'number' ? level - 1 : undefined

	// When input is not an object, just return the option value
	if (typeof base !== 'object' || base === null) return option as S

	const merged = copy ? copyState(base) : base
	for (const key in option) {
		type Key = keyof S
		type Value = S[Key]

		const value = option[key]
		if (value === undefined || value === null) continue

		const prev = merged[key as Key]
		if (typeof value === 'object') {
			if (Array.isArray(prev) && Array.isArray(value)) {
				if (value.length > 0) {
					merged[key as Key] = prev.concat(value) as Value
				}
			} else {
				const newVal = mergeState(prev, value, nextLevel, false) as Value
				if (newVal !== prev) {
					merged[key as Key] = newVal
				}
			}
		} else if (prev !== value) {
			merged[key as Key] = value
		}
	}

	return merged
}
