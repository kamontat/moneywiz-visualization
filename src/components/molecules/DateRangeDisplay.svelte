<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/models/props'
	import { formatDate } from '$lib/formatters/date'

	type Props = Pick<BaseProps, 'class'> &
		CustomProps<{
			start: Date
			end: Date
		}>

	let { start, end, class: className }: Props = $props()
	const baseClass = ['font-medium', 'whitespace-nowrap']
	const defaultClass = ['text-xs', 'text-mw-text-secondary']
</script>

<span class={[...baseClass, className ?? defaultClass].flat()}>
	{formatDate(start)}
	<span class="mx-1 opacity-50">—</span>
	{formatDate(end)}
</span>
