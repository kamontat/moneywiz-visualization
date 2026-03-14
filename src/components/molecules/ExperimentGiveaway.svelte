<script lang="ts">
	import type { GiveawayPoint } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { barChartOptions, toGiveawayData, mergeClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			points: GiveawayPoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toGiveawayData(points))
	const chartOptions = $derived(barChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No giveaway data available
		</p>
	{/if}
</div>
