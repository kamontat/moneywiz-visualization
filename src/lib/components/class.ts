/**
 * When variant is undefined returns BaseClass
 * When variant is 'plain' returns VariantClass[plain]
 * When variant is other value returns BaseClass + VariantClass[variant]
 */

import type { ClassArray, ClassArrayString, ClassName } from './models'

type ClassSelector<ARG, O extends ClassName> = (arg?: ARG) => O

export const newTwClass = (className: ClassArrayString) => className

type BaseClass = ClassArrayString
type BaseClassSelector = ClassSelector<string, BaseClass>
export const newBaseClass = (baseClass: BaseClass): BaseClassSelector => {
	return (variant) => (variant !== 'plain' ? baseClass : [])
}

type VariantClass<K extends string> = Record<K, ClassArrayString>
type VariantClassSelector<K extends string> = ClassSelector<
	K,
	VariantClass<K>[K]
>
export const newVariantClass = <V extends string>(
	variantClass: VariantClass<V>
): VariantClassSelector<V> => {
	return (variant) => (variant ? variantClass[variant] : [])
}

export const mergeClass = (
	base: BaseClass,
	...additionals: (ClassName | null | undefined)[]
): ClassArray => {
	const flat = additionals.flat()
	return [...base, ...flat]
}
