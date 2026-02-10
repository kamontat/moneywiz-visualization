<script lang="ts">
	import type { CumulativeSavingsPoint } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { barChartOptions, toCumulativeSavingsData } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			points: CumulativeSavingsPoint[]
			target: number
			ontargetchange?: (target: number) => void
		}>

	let {
		points,
		target,
		ontargetchange,
		class: className,
		...rest
	}: Props = $props()

	const chartData = $derived(toCumulativeSavingsData(points))
	const chartOptions = $derived(barChartOptions())
	const onInput = (value: string) => {
		const parsed = Number(value)
		if (Number.isNaN(parsed)) return
		ontargetchange?.(parsed)
	}
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-4'], className)} {...rest}>
	<label class="d-form-control w-full max-w-xs">
		<span class="d-label-text text-sm text-base-content/70">Monthly target</span
		>
		<input
			type="number"
			class="d-input-bordered d-input"
			value={target}
			oninput={(event) => onInput(event.currentTarget.value)}
		/>
	</label>

	{#if points.length > 0}
		<ChartCanvas type="line" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No savings data available
		</p>
	{/if}
</div>
