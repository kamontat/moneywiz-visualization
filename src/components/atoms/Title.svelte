<script lang="ts">
	import type { BaseProps, ElementTagProps } from '$lib/components/models'
	import {
		mergeClass,
		newBaseClass,
		newTwClass,
		newVariantClass,
	} from '$lib/components'

	type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	type Props = BaseProps & ElementTagProps<TagName>
	let { tag = 'h1', children, class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass(['text-base-content', 'm-0'])
	const variantClass = newVariantClass<TagName>({
		h1: newTwClass(['text-3xl', 'font-bold', 'tracking-tight']),
		h2: newTwClass(['text-2xl', 'font-bold']),
		h3: newTwClass(['text-lg', 'font-semibold']),
		h4: newTwClass(['text-base', 'font-semibold']),
		h5: newTwClass(['text-sm', 'font-semibold']),
		h6: newTwClass(['text-xs', 'font-semibold']),
	})
</script>

<svelte:element
	this={tag}
	class={mergeClass(baseClass(tag), variantClass(tag), className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
