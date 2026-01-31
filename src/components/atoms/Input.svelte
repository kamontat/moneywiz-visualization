<script lang="ts">
	import type { BaseProps, ElementProps, VariantProps } from '$lib/components/models'
	import { mergeClass, newBaseClass, newTwClass, newVariantClass } from '$lib/components'

	type Variant = 'plain' | 'primary' | 'secondary' | 'danger'
	type Props = Omit<BaseProps, 'children'> & VariantProps<Variant> & ElementProps<'input'>
	let { variant = 'primary', class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass([])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		primary: newTwClass(['bg-blue-600', 'text-white', 'hover:bg-blue-700']),
		secondary: newTwClass(['bg-gray-100', 'text-gray-800', 'hover:bg-gray-200']),
		danger: newTwClass(['bg-red-600', 'text-white', 'hover:bg-red-700']),
	})
</script>

<input class={mergeClass(baseClass(variant), variantClass(variant), className)} {...rest} />
