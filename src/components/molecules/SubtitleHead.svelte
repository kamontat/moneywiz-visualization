<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import FileTextIcon from '@iconify-svelte/lucide/file-text'

	import { formatDate } from '$lib/formatters/date'

	type Props = BaseProps &
		CustomProps<{
			startDate?: Date
			endDate?: Date
			total: number
			filtered?: number
		}>

	let { startDate, endDate, total, filtered }: Props = $props()

	const hasFilter = $derived(filtered !== undefined && filtered !== total)
</script>

<div class="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
	<span class="flex items-center gap-1.5">
		<CalendarIcon class="h-4 w-4" />
		{#if startDate && endDate}
			{formatDate(startDate)} – {formatDate(endDate)}
		{:else}
			<span class="italic">No date range</span>
		{/if}
	</span>
	<span class="flex items-center gap-1.5">
		<FileTextIcon class="h-4 w-4" />
		{#if hasFilter}
			<span
				class="font-medium text-base-content"
				data-testid="transaction-count">{filtered?.toLocaleString()}</span
			>
			of {total.toLocaleString()} transactions
		{:else}
			<span
				class="font-medium text-base-content"
				data-testid="transaction-count">{total.toLocaleString()}</span
			>
			transactions
		{/if}
	</span>
</div>
