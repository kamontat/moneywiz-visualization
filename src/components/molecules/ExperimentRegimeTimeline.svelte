<script lang="ts">
	import type { RegimeSegment } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { barChartOptions, toRegimeTimelineData, mergeClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			segments: RegimeSegment[]
		}>

	let { segments, class: className, ...rest }: Props = $props()

	const chartData = $derived(toRegimeTimelineData(segments))
	const chartOptions = $derived(barChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if segments.length > 0}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No regime timeline available
		</p>
	{/if}
</div>
