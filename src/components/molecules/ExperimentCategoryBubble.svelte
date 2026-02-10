<script lang="ts">
	import type { CategoryBubblePoint } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { bubbleChartOptions, toCategoryBubbleData } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			points: CategoryBubblePoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCategoryBubbleData(points))
	const chartOptions = $derived(bubbleChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="bubble" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No category bubble data available
		</p>
	{/if}
</div>
