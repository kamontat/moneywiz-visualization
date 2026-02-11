<script lang="ts">
	import type { ChartData } from 'chart.js'
	import type {
		StatsDashboard,
		StatsDeltaMetric,
		StatsKpiItem,
		StatsRange,
	} from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import Panel from '$components/atoms/Panel.svelte'
	import StatCard from '$components/atoms/StatCard.svelte'
	import { byStatsDashboard, transform } from '$lib/analytics/transforms'
	import {
		barChartOptions,
		doughnutChartOptions,
		getCategoryPalette,
		horizontalBarChartOptions,
	} from '$lib/charts'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

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
				topCategoryLimit: 5,
				topPayeeLimit: 8,
				volatilityLimit: 5,
			})
		)
	})

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

	const concentrationChartData = $derived.by<ChartData<'bar'>>(() => {
		if (!stats || stats.concentration.topCategories.length === 0) {
			return { labels: [], datasets: [] }
		}

		const colors = getCategoryPalette(stats.concentration.topCategories.length)

		return {
			labels: stats.concentration.topCategories.map((item) => item.name),
			datasets: [
				{
					label: 'Share',
					data: stats.concentration.topCategories.map((item) => item.share),
					backgroundColor: colors,
					borderWidth: 0,
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

	const weekdayChartData = $derived.by<ChartData<'bar'>>(() => {
		if (!stats) return { labels: [], datasets: [] }
		const colors = getCategoryPalette(stats.cadence.weekdaySpend.length)
		return {
			labels: stats.cadence.weekdaySpend.map((item) => item.weekday),
			datasets: [
				{
					label: 'Spend',
					data: stats.cadence.weekdaySpend.map((item) => item.amount),
					backgroundColor: colors,
					borderWidth: 0,
				},
			],
		}
	})

	const flowMixOptions = $derived(doughnutChartOptions())
	const concentrationOptions = $derived(horizontalBarChartOptions())
	const regimeOptions = $derived(barChartOptions())
	const weekdayOptions = $derived(barChartOptions())

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}%`
	}

	const formatMetricValue = (metric: {
		unit: string
		value: number
	}): string => {
		if (metric.unit === 'currency') return formatCurrency(metric.value)
		if (metric.unit === 'percent') return formatPercent(metric.value)
		return metric.value.toLocaleString('th-TH', {
			maximumFractionDigits: 2,
		})
	}

	const formatDelta = (metric: StatsDeltaMetric | StatsKpiItem): string => {
		if (metric.delta.delta === null || metric.delta.baseline === null) {
			return 'No baseline period data'
		}

		const deltaValue = metric.delta.delta
		const sign = deltaValue > 0 ? '+' : ''
		const isPercentMetric =
			('unit' in metric && metric.unit === 'percent') ||
			metric.id === 'savingsRate'
		const valueLabel = isPercentMetric
			? `${sign}${deltaValue.toLocaleString('th-TH', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}pp`
			: `${sign}${formatCurrency(deltaValue)}`

		if (metric.delta.deltaPct === null) {
			return `vs baseline: ${valueLabel}`
		}

		return `vs baseline: ${valueLabel} (${sign}${metric.delta.deltaPct.toLocaleString(
			'th-TH',
			{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
		)}%)`
	}

	const isFavorable = (
		metric: StatsDeltaMetric | StatsKpiItem
	): boolean | null => {
		if (metric.delta.delta === null) return null
		if (metric.betterWhen === 'neutral') return null
		if (metric.betterWhen === 'higher') return metric.delta.delta >= 0
		return metric.delta.delta <= 0
	}

	const metricVariant = (
		metric: StatsDeltaMetric | StatsKpiItem
	): 'plain' | 'income' | 'expense' | 'neutral' | 'highlight' => {
		const favorable = isFavorable(metric)
		if (favorable === null) return 'neutral'
		return favorable ? 'income' : 'expense'
	}

	const concentrationLabel = (hhi: number): string => {
		if (hhi >= 0.25) return 'High concentration'
		if (hhi >= 0.15) return 'Moderate concentration'
		return 'Diversified'
	}
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if !stats}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions for stats. Adjust filters or date range.
			</p>
		</Panel>
	{:else}
		{#if stats.currency.mixedCurrency}
			<div class="d-alert rounded-box d-alert-warning">
				<span>
					Mixed currencies detected. Stats are displayed in
					{stats.currency.primaryCurrency}.
				</span>
			</div>
		{/if}

		<Panel title="KPI Snapshot">
			<p class="mb-4 text-sm text-base-content/70">
				Current: {stats.currentRange.label}
				{#if stats.baselineRange}
					• Baseline: {stats.baselineRange.label}
				{/if}
			</p>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each stats.kpis as metric (metric.id)}
					<StatCard
						variant={metricVariant(metric)}
						title={metric.label}
						value={formatMetricValue(metric)}
						description={formatDelta(metric)}
					/>
				{/each}
			</div>
		</Panel>

		<Panel title="Period Comparison">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{#each stats.comparison as metric (metric.id)}
					<div
						class={mergeClass(
							['rounded-box', 'border', 'p-4', 'transition-colors'],
							metricVariant(metric) === 'income'
								? 'border-success/30 bg-success/10'
								: undefined,
							metricVariant(metric) === 'expense'
								? 'border-error/30 bg-error/10'
								: undefined,
							metricVariant(metric) === 'neutral'
								? 'border-base-300 bg-base-200/40'
								: undefined
						)}
					>
						<p class="text-sm text-base-content/70">{metric.label}</p>
						<p class="mt-2 text-sm font-medium text-base-content">
							{formatDelta(metric)}
						</p>
					</div>
				{/each}
			</div>
		</Panel>

		<Panel title="Money Flow Composition">
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

		<Panel title="Concentration">
			<div class="grid grid-cols-1 gap-6 2xl:grid-cols-2">
				<div>
					<p class="mb-3 text-sm text-base-content/70">
						Expense categories: {concentrationLabel(
							stats.concentration.categoryHhi
						)}
						(HHI {stats.concentration.categoryHhi.toFixed(3)})
					</p>
					{#if (concentrationChartData.labels?.length ?? 0) > 0}
						<ChartCanvas
							type="bar"
							data={concentrationChartData}
							options={concentrationOptions}
						/>
					{:else}
						<p class="py-8 text-center text-sm text-base-content/60">
							No category concentration data.
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-6">
					<div class="overflow-x-auto">
						<p class="mb-2 text-sm font-semibold text-base-content/80">
							Top Categories
						</p>
						<table class="d-table-compact d-table">
							<tbody>
								{#each stats.concentration.topCategories as item (item.name)}
									<tr>
										<td>{item.name}</td>
										<td class="text-right">{formatCurrency(item.amount)}</td>
										<td class="text-right">{formatPercent(item.share)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="overflow-x-auto">
						<p class="mb-2 text-sm font-semibold text-base-content/80">
							Top Payees
						</p>
						<p class="mb-2 text-xs text-base-content/60">
							{concentrationLabel(stats.concentration.payeeHhi)} (HHI
							{stats.concentration.payeeHhi.toFixed(3)})
						</p>
						<table class="d-table-compact d-table">
							<tbody>
								{#each stats.concentration.topPayees as item (item.name)}
									<tr>
										<td>{item.name}</td>
										<td class="text-right">{formatCurrency(item.amount)}</td>
										<td class="text-right">{formatPercent(item.share)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</Panel>

		<Panel title="Risk & Stability">
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

		<Panel title="Cadence & Hygiene">
			<div class="grid grid-cols-1 gap-6 2xl:grid-cols-2">
				<div>
					<ChartCanvas
						type="bar"
						data={weekdayChartData}
						options={weekdayOptions}
					/>
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
