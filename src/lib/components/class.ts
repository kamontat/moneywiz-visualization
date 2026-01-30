import type { ClassArray, ClassArrayString, ClassName } from './models'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassSelector<ARGS extends any[], O extends ClassName> = (...args: ARGS) => O

export const newTwClass = (className: ClassArrayString) => className

type BaseClass = ClassArrayString
type BaseClassSelector = ClassSelector<[BaseClass], BaseClass>
export const newBaseClass: BaseClassSelector = (baseClass) => baseClass

type VariantClass<K extends string> = Record<K, ClassArrayString>
type VariantClassSelector<K extends string> = ClassSelector<[variant: K], VariantClass<K>[K]>
export const newVariantClass = <V extends string>(
	variantClass: VariantClass<V>
): VariantClassSelector<V> => {
	return (variant) => variantClass[variant]
}

export const mergeClass = (
	base: BaseClass,
	...additionals: (ClassName | null | undefined)[]
): ClassArray => {
	const flat = additionals.flat()
	return [...base, ...flat]
}
