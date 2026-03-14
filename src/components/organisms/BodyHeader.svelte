<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps } from '$lib/ui'
	import SubtitleHead from '$components/molecules/SubtitleHead.svelte'
	import TitleHead from '$components/molecules/TitleHead.svelte'

	type Props = BaseProps &
		CustomProps<{
			fileName?: string
			startDate?: Date
			endDate?: Date
			baselineStartDate?: Date
			baselineEndDate?: Date
			totalRows?: number
			filteredRows?: number
		}> &
		ElementProps<'div'>

	let {
		fileName = 'No file loaded',
		startDate,
		endDate,
		baselineStartDate,
		baselineEndDate,
		totalRows = 0,
		filteredRows,
		class: _className,
	}: Props = $props()
</script>

<div class="flex flex-col gap-2">
	<TitleHead name={fileName} />
	<SubtitleHead
		{startDate}
		{endDate}
		{baselineStartDate}
		{baselineEndDate}
		total={totalRows}
		filtered={filteredRows}
	/>
</div>
