<script lang="ts">
	import type { CalendarCell } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		matrixChartOptions,
		toCalendarHeatmapData,
		mergeClass,
	} from '$lib/ui'

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
