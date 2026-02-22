<script lang="ts">
	import type { ChartData } from 'chart.js'
	import type {
		StatsDashboard,
		StatsRange,
	} from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { onDestroy } from 'svelte'

	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import Panel from '$components/atoms/Panel.svelte'
	import ExperimentCalendarHeatmap from '$components/molecules/ExperimentCalendarHeatmap.svelte'
	import {
		byCalendarHeatmap,
		byStatsDashboard,
		transform,
	} from '$lib/analytics/transforms'
	import {
		barChartOptions,
		doughnutChartOptions,
		getCategoryPalette,
	} from '$lib/charts'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'
	import { dismissNotification, pushNotification } from '$lib/notifications'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			baselineTransactions?: ParsedTransaction[]
			currentRange?: StatsRange | null
			baselineRange?: StatsRange | null
		}>

	let {
		transactions,
		baselineTransactions = [],
		currentRange = null,
		baselineRange = null,
		class: className,
		...rest
	}: Props = $props()

	const stats = $derived.by<StatsDashboard | undefined>(() => {
		if (transactions.length === 0) return undefined
		return transform(
			transactions,
			byStatsDashboard(baselineTransactions, {
				currentRange: currentRange ?? undefined,
				baselineRange,
				volatilityLimit: 5,
			})
		)
	})

	const calendarCells = $derived(transform(transactions, byCalendarHeatmap))

	const flowMixChartData = $derived.by<ChartData<'doughnut'>>(() => {
		if (!stats) return { labels: [], datasets: [] }
		const colors = getCategoryPalette(stats.flowMix.length)

		return {
			labels: stats.flowMix.map((item) => item.label),
			datasets: [
				{
					data: stats.flowMix.map((item) => Math.abs(item.amount)),
					backgroundColor: colors,
					borderWidth: 2,
				},
			],
		}
	})

	const regimeChartData = $derived.by<ChartData<'bar'>>(() => {
		if (!stats) return { labels: [], datasets: [] }

		return {
			labels: ['Stable', 'Stressed', 'Deficit'],
			datasets: [
				{
					label: 'Months',
					data: [
						stats.risk.regimeCounts.stable,
						stats.risk.regimeCounts.stressed,
						stats.risk.regimeCounts.deficit,
					],
					backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
					borderWidth: 0,
				},
			],
		}
	})

	const flowMixOptions = $derived(doughnutChartOptions())
	const regimeOptions = $derived(barChartOptions())

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}%`
	}

	let mixedCurrencyNotificationId = $state<string | undefined>(undefined)
	let mixedCurrencyNotificationText = $state<string | undefined>(undefined)

	$effect(() => {
		const currency = stats?.currency
		if (!currency?.mixedCurrency) {
			if (mixedCurrencyNotificationId) {
				dismissNotification(mixedCurrencyNotificationId)
			}
			mixedCurrencyNotificationId = undefined
			mixedCurrencyNotificationText = undefined
			return
		}

		const text = `Mixed currencies detected. Stats are displayed in ${currency.primaryCurrency}.`
		if (mixedCurrencyNotificationId && mixedCurrencyNotificationText === text) {
			return
		}

		if (mixedCurrencyNotificationId) {
			dismissNotification(mixedCurrencyNotificationId)
		}

		mixedCurrencyNotificationId = pushNotification({
			variant: 'warning',
			text,
		})
		mixedCurrencyNotificationText = text
	})

	onDestroy(() => {
		if (mixedCurrencyNotificationId) {
			dismissNotification(mixedCurrencyNotificationId)
		}
	})
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if !stats}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions for stats. Adjust filters or date range.
			</p>
		</Panel>
	{:else}
		<Panel
			title="Money Flow Composition"
			question="Share of activity by transaction flow type."
		>
			<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<div class="mx-auto w-full max-w-sm">
					<ChartCanvas
						type="doughnut"
						data={flowMixChartData}
						options={flowMixOptions}
					/>
				</div>
				<div class="overflow-x-auto">
					<table class="d-table d-table-zebra">
						<thead>
							<tr>
								<th>Flow</th>
								<th class="text-right">Amount</th>
								<th class="text-right">Share</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.flowMix as item (item.id)}
								<tr>
									<td>{item.label}</td>
									<td class="text-right">{formatCurrency(item.amount)}</td>
									<td class="text-right">{formatPercent(item.share)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Panel>

		<Panel
			title="Risk and Stability"
			question="Regime distribution and most volatile spending categories."
		>
			<div class="grid grid-cols-1 gap-6 2xl:grid-cols-2">
				<div>
					<p class="mb-3 text-sm text-base-content/70">
						Outlier day rate: {formatPercent(stats.risk.outlierDayRate)}
						({stats.risk.outlierDays}/{stats.risk.totalDays} days)
					</p>
					<ChartCanvas
						type="bar"
						data={regimeChartData}
						options={regimeOptions}
					/>
				</div>

				<div class="overflow-x-auto">
					<p class="mb-2 text-sm font-semibold text-base-content/80">
						Top Volatile Categories
					</p>
					<table class="d-table d-table-zebra">
						<thead>
							<tr>
								<th>Category</th>
								<th class="text-right">CoV</th>
								<th class="text-right">Mean</th>
								<th class="text-right">Months</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.risk.topVolatileCategories as item (item.category)}
								<tr>
									<td>{item.category}</td>
									<td class="text-right">
										{item.cov.toLocaleString('th-TH', {
											maximumFractionDigits: 2,
										})}
									</td>
									<td class="text-right">{formatCurrency(item.mean)}</td>
									<td class="text-right">{item.months}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Panel>

		<Panel
			title="Cadence and Data Quality"
			question="Daily activity heatmap with cadence and metadata quality indicators."
		>
			<div class="grid grid-cols-1 gap-6 2xl:grid-cols-2">
				<div>
					<p class="mb-3 text-sm text-base-content/70">
						Daily net-flow intensity calendar.
					</p>
					<ExperimentCalendarHeatmap cells={calendarCells} />
				</div>

				<div class="space-y-2 text-sm">
					<p>
						<span class="text-base-content/70">Active days:</span>
						{stats.cadence.activeDays}
					</p>
					<p>
						<span class="text-base-content/70">No-spend days:</span>
						{stats.cadence.noSpendDays}
					</p>
					<p>
						<span class="text-base-content/70"
							>Avg transactions/active day:</span
						>
						{stats.cadence.avgTransactionsPerActiveDay.toLocaleString('th-TH', {
							maximumFractionDigits: 2,
						})}
					</p>
					<p>
						<span class="text-base-content/70">Uncategorized rate:</span>
						{formatPercent(stats.cadence.uncategorizedRate)}
					</p>
					<p>
						<span class="text-base-content/70">Unknown payee rate:</span>
						{formatPercent(stats.cadence.unknownPayeeRate)}
					</p>
				</div>
			</div>
		</Panel>
	{/if}
</div>
