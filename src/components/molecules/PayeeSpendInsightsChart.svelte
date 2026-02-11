<script lang="ts">
	import type { ActiveElement, Chart, ChartEvent, TooltipItem } from 'chart.js'
	import type { PayeeSpendAnalysis } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { onMount } from 'svelte'

	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		barChartOptions as getBarChartOptions,
		lineChartOptions,
		toPayeeSpendBarData,
		toPayeeSpendTrendData,
	} from '$lib/charts'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			analysis: PayeeSpendAnalysis
		}>

	let { analysis, class: className, ...rest }: Props = $props()

	let selectedPayee = $state<string | undefined>()
	let payeeLimit = $state(5)

	const resolvePayeeLimit = (width: number): number => {
		if (width >= 1280) return 20
		if (width >= 640) return 10
		return 5
	}

	onMount(() => {
		const updatePayeeLimit = () => {
			payeeLimit = resolvePayeeLimit(window.innerWidth)
		}

		updatePayeeLimit()
		window.addEventListener('resize', updatePayeeLimit)

		return () => {
			window.removeEventListener('resize', updatePayeeLimit)
		}
	})

	const toNumber = (value: unknown): number => {
		if (typeof value === 'number' && Number.isFinite(value)) {
			return value
		}

		if (typeof value === 'string') {
			const parsed = Number(value)
			return Number.isFinite(parsed) ? parsed : 0
		}

		return 0
	}

	const hasData = $derived(analysis.topPayees.length > 0)
	const topPayee = $derived(analysis.topPayees[0])
	const visibleTopPayees = $derived(analysis.topPayees.slice(0, payeeLimit))
	const selectedPayeeData = $derived(
		visibleTopPayees.find((payee) => payee.payee === selectedPayee)
	)
	const selectedSeries = $derived(
		selectedPayee ? analysis.seriesByPayee[selectedPayee] : undefined
	)
	const selectedTransactionCount = $derived(
		selectedPayeeData?.transactionCount ?? 0
	)
	const barData = $derived(toPayeeSpendBarData(visibleTopPayees))
	const trendData = $derived(toPayeeSpendTrendData(selectedSeries))

	const onBarClick = (
		_: ChartEvent,
		activeElements: ActiveElement[],
		chart: Chart<'bar'>
	) => {
		if (activeElements.length === 0) return
		const [first] = activeElements
		const label = chart.data.labels?.[first.index]
		if (typeof label === 'string') selectedPayee = label
	}

	const barChartOptions = $derived.by(() => {
		const baseOptions = getBarChartOptions()

		return {
			...baseOptions,
			onClick: onBarClick,
			plugins: {
				...baseOptions.plugins,
				legend: {
					display: false,
				},
				tooltip: {
					...baseOptions.plugins?.tooltip,
					callbacks: {
						title: (items: TooltipItem<'bar'>[]) =>
							String(items[0]?.label ?? ''),
						label: (context: TooltipItem<'bar'>) => {
							const value = toNumber(context.raw ?? context.parsed.y)
							return `Net Spend: ${formatCurrency(value)}`
						},
						afterLabel: (context: TooltipItem<'bar'>) => {
							const payee = visibleTopPayees[context.dataIndex]
							if (!payee) return ''

							const share =
								analysis.totalNetSpend > 0
									? (payee.netSpend / analysis.totalNetSpend) * 100
									: 0

								return [
									`Transactions: ${payee.transactionCount.toLocaleString()}`,
									`Average: ${formatCurrency(payee.avgTicket)}`,
									`Share: ${share.toFixed(1)}%`,
								]
						},
					},
				},
			},
		}
	})

	const trendChartOptions = $derived.by(() => {
		const baseOptions = lineChartOptions()

		return {
			...baseOptions,
			plugins: {
				...baseOptions.plugins,
				legend: {
					display: false,
				},
				tooltip: {
					...baseOptions.plugins?.tooltip,
					callbacks: {
						label: (context: TooltipItem<'line'>) => {
							const value = toNumber(context.raw ?? context.parsed.y)
							return `Net Spend: ${formatCurrency(value)}`
						},
						afterLabel: (context: TooltipItem<'line'>) => {
							const point = selectedSeries?.points[context.dataIndex]
							if (!point) return ''
							return `Transactions: ${point.transactionCount.toLocaleString()}`
						},
					},
				},
			},
		}
	})

	$effect(() => {
		if (!hasData) {
			selectedPayee = undefined
			return
		}

		if (
			!selectedPayee ||
			!visibleTopPayees.some((payee) => payee.payee === selectedPayee)
		) {
			selectedPayee = visibleTopPayees[0]?.payee
		}
	})
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if hasData}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="rounded-box bg-base-100/50 p-3">
				<p class="text-xs tracking-wider text-base-content/60 uppercase">
					Unique Payees
				</p>
				<p class="mt-1 text-xl font-semibold text-base-content">
					{analysis.uniquePayeeCount.toLocaleString()}
				</p>
			</div>
			<div class="rounded-box bg-base-100/50 p-3">
				<p class="text-xs tracking-wider text-base-content/60 uppercase">
					Top Payee
				</p>
				<p class="mt-1 truncate text-sm text-base-content/70">
					{topPayee?.payee ?? '-'}
				</p>
				<p class="text-lg font-semibold text-base-content">
					{topPayee ? formatCurrency(topPayee.netSpend) : formatCurrency(0)}
				</p>
			</div>
			<div class="rounded-box bg-base-100/50 p-3">
				<p class="text-xs tracking-wider text-base-content/60 uppercase">
					Selected Payee Transactions
				</p>
				<p class="mt-1 text-xl font-semibold text-base-content">
					{selectedTransactionCount.toLocaleString()}
				</p>
			</div>
		</div>

		<div class="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
			<div class="rounded-box bg-base-100/40 p-3 sm:p-4">
				<p class="mb-3 text-sm font-medium text-base-content/80">
					Top Payees by Net Spend
				</p>
				<ChartCanvas type="bar" data={barData} options={barChartOptions} />
			</div>

			<div class="rounded-box bg-base-100/40 p-3 sm:p-4">
				<div class="mb-3 flex items-center justify-between gap-2">
					<div class="min-w-0">
						<p class="text-sm font-medium text-base-content/80">
							Selected Payee Trend
						</p>
						<p class="truncate text-sm text-base-content/60">
							{selectedPayee ?? '-'}
						</p>
					</div>
					{#if selectedSeries}
						<span class="d-badge d-badge-outline d-badge-sm">
							{selectedSeries.mode}
						</span>
					{/if}
				</div>

				{#if selectedSeries && selectedSeries.points.length > 0}
					<ChartCanvas
						type="line"
						data={trendData}
						options={trendChartOptions}
					/>
				{:else}
					<p class="py-8 text-center text-sm text-base-content/60">
						No trend data available for this payee
					</p>
				{/if}
			</div>
		</div>
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No payee spend data available
		</p>
	{/if}
</div>
