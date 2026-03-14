<script lang="ts">
	import type { WindfallPoint } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { barChartOptions, toWindfallData, mergeClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			points: WindfallPoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toWindfallData(points))
	const chartOptions = $derived(barChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No windfall data available
		</p>
	{/if}
</div>
