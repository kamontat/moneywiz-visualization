<script lang="ts">
	import type { TimeSeries } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		toCashFlowTrendChartData,
		lineChartOptions,
		mergeClass,
	} from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			timeSeries: TimeSeries
		}>

	let { timeSeries, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCashFlowTrendChartData(timeSeries))
	const chartOptions = $derived(lineChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if timeSeries.points.length > 0}
		<ChartCanvas type="line" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No trend data available
		</p>
	{/if}
</div>
