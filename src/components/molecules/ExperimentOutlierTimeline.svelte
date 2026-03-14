<script lang="ts">
	import type { OutlierPoint } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { lineChartOptions, toOutlierTimelineData, mergeClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			points: OutlierPoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toOutlierTimelineData(points))
	const chartOptions = $derived(lineChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="line" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No outlier timeline available
		</p>
	{/if}
</div>
