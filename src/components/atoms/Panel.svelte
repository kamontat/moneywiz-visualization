<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			title?: string
		}>

	let { title, children, class: className, ...rest }: Props = $props()

	const baseClass = newTwClass([
		'rounded-box',
		'bg-base-200/50',
		'p-4',
		'sm:p-6',
	])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	{#if title}
		<h3 class="mb-4 text-lg font-semibold text-base-content">{title}</h3>
	{/if}
	{@render children?.()}
</div>
