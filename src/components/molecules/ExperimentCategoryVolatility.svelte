<script lang="ts">
	import type { CategoryVolatilityPoint } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { scatterChartOptions, toCategoryVolatilityData } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			points: CategoryVolatilityPoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCategoryVolatilityData(points))
	const chartOptions = $derived(scatterChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="scatter" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No volatility data available
		</p>
	{/if}
</div>
