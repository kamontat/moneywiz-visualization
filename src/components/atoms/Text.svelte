<script lang="ts">
	import type { BaseProps, ElementTagProps } from '$lib/components/models'
	import {
		mergeClass,
		newBaseClass,
		newTwClass,
		newVariantClass,
	} from '$lib/components'

	type TagName = 'p' | 'span' | 'small' | 'code'
	type Props = BaseProps & ElementTagProps<TagName>
	let { tag = 'span', children, class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass(['m-0', 'text-base'])
	const variantClass = newVariantClass<TagName>({
		p: newTwClass([]),
		span: newTwClass(['sm:text-lg']),
		code: newTwClass(['font-mono']),
		small: newTwClass(['text-sm', 'text-base-content/60']),
	})
</script>

<svelte:element
	this={tag}
	class={mergeClass(baseClass(tag), variantClass(tag), className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
