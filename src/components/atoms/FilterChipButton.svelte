<script lang="ts">
	import type {
		BaseProps,
		Children,
		CustomProps,
		ElementProps,
	} from '$lib/components/models'
	import ChevronDown from '@iconify-svelte/lucide/chevron-down'

	import { mergeClass, newTwClass } from '$lib/components'

	type Props = Omit<BaseProps, 'children'> &
		CustomProps<{
			label: string
			icon?: Children
			active?: boolean
			expanded?: boolean
			count?: number
		}> &
		ElementProps<'button'>

	let {
		label,
		icon,
		active = false,
		expanded = false,
		count = 0,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newTwClass([
		'd-btn',
		'd-btn-sm',
		'gap-1.5',
		'rounded-full',
		'border',
		'bg-base-100',
		'font-medium',
		'shadow-sm',
		'transition-all',
		'hover:shadow-md',
		'min-h-0',
		'h-8',
	])
	const activeClass = newTwClass([
		'border-primary/40',
		'text-primary',
		'hover:border-primary/60',
	])
	const inactiveClass = newTwClass([
		'border-base-300',
		'text-base-content/70',
		'hover:border-base-content/30',
	])
</script>

<button
	type="button"
	class={mergeClass(baseClass, active ? activeClass : inactiveClass, className)}
	{...rest}
>
	{@render icon?.()}
	<span class="text-xs">{label}</span>
	{#if count > 0}
		<span class="d-badge min-h-0 min-w-4 text-xs d-badge-xs d-badge-primary">
			{count}
		</span>
	{/if}
	<ChevronDown
		class={mergeClass(
			['size-3', 'transition-transform', 'duration-200'],
			expanded ? 'rotate-180' : undefined
		)}
	/>
</button>
