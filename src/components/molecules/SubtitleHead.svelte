<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import FileTextIcon from '@iconify-svelte/lucide/file-text'

	import { formatDate } from '$lib/formatters/date'

	type Props = BaseProps &
		CustomProps<{
			startDate?: Date
			endDate?: Date
			baselineStartDate?: Date
			baselineEndDate?: Date
			total: number
			filtered?: number
		}>

	let {
		startDate,
		endDate,
		baselineStartDate,
		baselineEndDate,
		total,
		filtered,
	}: Props = $props()

	const hasFilter = $derived(filtered !== undefined && filtered !== total)
</script>

<div
	class="flex flex-col gap-3 text-sm text-base-content/60 sm:flex-row
		sm:flex-wrap sm:items-center sm:gap-4"
>
	<span class="flex items-start gap-1.5">
		<CalendarIcon class="mt-0.5 h-4 w-4 shrink-0" />
		{#if startDate && endDate}
			<span class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
				<span>{formatDate(startDate)} – {formatDate(endDate)}</span>
				{#if baselineStartDate && baselineEndDate}
					<span class="hidden text-base-content/40 sm:inline">•</span>
					<span class="text-base-content/50">
						Baseline: {formatDate(baselineStartDate)} – {formatDate(
							baselineEndDate
						)}
					</span>
				{/if}
			</span>
		{:else}
			<span class="italic">No date range</span>
		{/if}
	</span>
	<span class="flex items-center gap-1.5">
		<FileTextIcon class="h-4 w-4 shrink-0" />
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
