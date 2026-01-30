<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps } from '$lib/models/props'

	type Props = BaseProps &
		ElementProps<'button'> &
		CustomProps<{
			id?: string
			level?: 1 | 2 | 3 | 4 | 5 | 6
		}>

	let { level = 2, children, class: className = '', id }: Props = $props()

	const baseClass = ['text-mw-text-main', 'm-0']
	const variantClass = {
		1: ['text-3xl', 'font-bold', 'tracking-tight'],
		2: ['text-2xl', 'font-bold'],
		3: ['text-lg', 'font-semibold'],
		4: ['text-base', 'font-semibold'],
		5: ['text-sm', 'font-semibold'],
		6: ['text-xs', 'font-semibold'],
	}
</script>

<svelte:element
	this={`h${level}`}
	{id}
	class={[...baseClass, ...(variantClass[level] ?? []), className].flat()}
>
	{@render children?.()}
</svelte:element>
