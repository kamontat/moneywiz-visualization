<script lang="ts">
	import type { ChartConfiguration } from 'chart.js'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { Chart, registerables } from 'chart.js'
	import { onMount, onDestroy } from 'svelte'

	import { mergeClass } from '$lib/components'

	const chartPluginRegistryFlag = '__moneywizChartPluginsRegistered__'

	type ChartType =
		| 'line'
		| 'bar'
		| 'doughnut'
		| 'pie'
		| 'scatter'
		| 'bubble'
		| 'sankey'
		| 'matrix'
		| 'treemap'

	type Props = BaseProps &
		CustomProps<{
			type: ChartType
			data: unknown
			options?: unknown
		}>

	let { type, data, options, class: className, ...rest }: Props = $props()

	let canvas: HTMLCanvasElement | undefined = $state()
	let chartInstance: Chart | undefined = $state()

	onMount(async () => {
		if ((globalThis as Record<string, unknown>)[chartPluginRegistryFlag]) {
			return
		}

		const [
			{ MatrixController, MatrixElement },
			{ SankeyController, Flow },
			{ TreemapController, TreemapElement },
		] = await Promise.all([
			import('chartjs-chart-matrix'),
			import('chartjs-chart-sankey'),
			import('chartjs-chart-treemap'),
		])

		Chart.register(
			...registerables,
			MatrixController,
			MatrixElement,
			SankeyController,
			Flow,
			TreemapController,
			TreemapElement
		)
		;(globalThis as Record<string, unknown>)[chartPluginRegistryFlag] = true
	})

	$effect(() => {
		if (!canvas) return

		if (chartInstance) {
			chartInstance.data = data as ChartConfiguration['data']
			if (options) {
				chartInstance.options = options as NonNullable<
					ChartConfiguration['options']
				>
			}
			chartInstance.update()
		} else {
			chartInstance = new Chart(canvas, {
				type,
				data: data as ChartConfiguration['data'],
				options: {
					responsive: true,
					maintainAspectRatio: true,
					...(options as Record<string, unknown> | undefined),
				} as ChartConfiguration['options'],
			})
		}
	})

	onDestroy(() => {
		chartInstance?.destroy()
	})
</script>

<div class={mergeClass(['relative', 'w-full'], className)} {...rest}>
	<canvas bind:this={canvas}></canvas>
</div>
