<script lang="ts">
	import type { CalendarCell } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { matrixChartOptions, toCalendarHeatmapData } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			cells: CalendarCell[]
		}>

	let { cells, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCalendarHeatmapData(cells))
	const chartOptions = $derived(matrixChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if cells.length > 0}
		<ChartCanvas type="matrix" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No calendar values available
		</p>
	{/if}
</div>
