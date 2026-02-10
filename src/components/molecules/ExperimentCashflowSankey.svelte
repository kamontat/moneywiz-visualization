<script lang="ts">
	import type { FlowLink } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { toCashflowSankeyData, treemapChartOptions } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			links: FlowLink[]
		}>

	let { links, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCashflowSankeyData(links))
	const chartOptions = $derived(treemapChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if links.length > 0}
		<ChartCanvas type="sankey" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No cashflow links available
		</p>
	{/if}
</div>
