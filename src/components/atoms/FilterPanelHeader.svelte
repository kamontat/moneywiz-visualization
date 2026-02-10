<script lang="ts">
	import type { BaseProps, Children, CustomProps } from '$lib/components/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = Omit<BaseProps, 'children'> &
		CustomProps<{
			title: string
			actions?: Children
			showClear?: boolean
			clearLabel?: string
			onclear?: () => void
		}>

	let {
		title,
		actions,
		showClear = false,
		clearLabel = 'Clear',
		onclear,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newTwClass([
		'flex',
		'items-center',
		'justify-between',
		'gap-2',
	])
	const titleClass = newTwClass([
		'text-xs',
		'font-semibold',
		'tracking-wider',
		'text-base-content/70',
		'uppercase',
	])
	const actionsClass = newTwClass(['flex', 'items-center', 'gap-2'])
	const clearClass = newTwClass([
		'text-xs',
		'text-base-content/60',
		'transition-colors',
		'hover:text-base-content',
	])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	<span class={titleClass}>{title}</span>
	{#if actions || showClear}
		<div class={actionsClass}>
			{@render actions?.()}
			{#if showClear}
				<button type="button" class={clearClass} onclick={() => onclear?.()}>
					{clearLabel}
				</button>
			{/if}
		</div>
	{/if}
</div>
