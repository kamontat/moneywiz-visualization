<script lang="ts">
	import type { ChartConfiguration } from 'chart.js'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { Chart, registerables } from 'chart.js'
	import { onMount, onDestroy } from 'svelte'

	import { mergeClass } from '$lib/components'

	const chartPluginRegistryFlag = '__moneywizChartPluginsRegistered__'
	let chartRegistrationPromise: Promise<void> | undefined

	type ChartType =
		| 'line'
		| 'bar'
		| 'doughnut'
		| 'pie'
		| 'scatter'
		| 'bubble'
		| 'matrix'

	type Props = BaseProps &
		CustomProps<{
			type: ChartType
			data: unknown
			options?: unknown
		}>

	let { type, data, options, class: className, ...rest }: Props = $props()

	let canvas: HTMLCanvasElement | undefined = $state()
	let container: HTMLDivElement | undefined = $state()
	let chartInstance: Chart | undefined = $state()
	let isChartReady = $state(false)
	let resizeFrame: number | undefined = $state()

	const queueResize = () => {
		if (typeof window === 'undefined') return

		if (resizeFrame !== undefined) {
			window.cancelAnimationFrame(resizeFrame)
		}

		resizeFrame = window.requestAnimationFrame(() => {
			resizeFrame = undefined
			chartInstance?.resize()
		})
	}

	const ensureChartRegistered = async () => {
		if ((globalThis as Record<string, unknown>)[chartPluginRegistryFlag]) {
			return
		}
		if (chartRegistrationPromise) {
			return chartRegistrationPromise
		}

		chartRegistrationPromise = (async () => {
			const [{ MatrixController, MatrixElement }] = await Promise.all([
				import('chartjs-chart-matrix'),
			])

			Chart.register(...registerables, MatrixController, MatrixElement)
			;(globalThis as Record<string, unknown>)[chartPluginRegistryFlag] = true
		})()

		return chartRegistrationPromise
	}

	onMount(() => {
		let isActive = true
		let resizeObserver: ResizeObserver | undefined

		const onWindowResize = () => {
			queueResize()
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', onWindowResize)
		}

		if (typeof ResizeObserver !== 'undefined' && container) {
			resizeObserver = new ResizeObserver(() => {
				queueResize()
			})
			resizeObserver.observe(container)
		}

		void ensureChartRegistered().then(() => {
			if (isActive) {
				isChartReady = true
			}
		})

		return () => {
			isActive = false
			if (typeof window !== 'undefined') {
				window.removeEventListener('resize', onWindowResize)
				if (resizeFrame !== undefined) {
					window.cancelAnimationFrame(resizeFrame)
					resizeFrame = undefined
				}
			}
			resizeObserver?.disconnect()
		}
	})

	$effect(() => {
		if (!canvas || !isChartReady) return

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
			queueResize()
		}
	})

	onDestroy(() => {
		chartInstance?.destroy()
	})
</script>

<div
	bind:this={container}
	class={mergeClass(['relative', 'w-full'], className)}
	{...rest}
>
	<canvas bind:this={canvas}></canvas>
</div>
