<script lang="ts">
	import type { TreemapNode } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { toTreemapData, treemapChartOptions } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			nodes: TreemapNode[]
		}>

	let { nodes, class: className, ...rest }: Props = $props()

	const chartData = $derived(toTreemapData(nodes))
	const chartOptions = $derived(treemapChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if nodes.length > 0}
		<ChartCanvas type="treemap" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No treemap data available
		</p>
	{/if}
</div>
