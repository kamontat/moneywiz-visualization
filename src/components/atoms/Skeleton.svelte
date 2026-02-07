<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		VariantProps,
	} from '$lib/components/models'
	import {
		mergeClass,
		newBaseClass,
		newVariantClass,
		newTwClass,
	} from '$lib/components'

	type Variant = 'plain' | 'text' | 'circle' | 'rectangle'
	type Props = BaseProps &
		VariantProps<Variant> &
		CustomProps<{
			width?: string
			height?: string
		}>

	let {
		variant = 'rectangle',
		width,
		height,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newBaseClass(['d-skeleton'])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		text: newTwClass(['h-4', 'w-full']),
		circle: newTwClass(['h-12', 'w-12', 'rounded-full', 'shrink-0']),
		rectangle: newTwClass(['h-32', 'w-full']),
	})

	let style = $derived(
		[width ? `width: ${width}` : '', height ? `height: ${height}` : '']
			.filter(Boolean)
			.join('; ') || undefined
	)
</script>

<div
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	{style}
	{...rest}
></div>
