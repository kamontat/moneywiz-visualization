<script lang="ts">
	import type {
		CashFlowDashboard,
		CashFlowKpi,
		StatsRange,
	} from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { onDestroy } from 'svelte'

	import Panel from '$components/atoms/Panel.svelte'
	import StatCard from '$components/atoms/StatCard.svelte'
	import ExpenseBreakdownChart from '$components/molecules/ExpenseBreakdownChart.svelte'
	import ExperimentMonthlyWaterfall from '$components/molecules/ExperimentMonthlyWaterfall.svelte'
	import IncomeBreakdownChart from '$components/molecules/IncomeBreakdownChart.svelte'
	import IncomeExpenseComparisonChart from '$components/molecules/IncomeExpenseComparisonChart.svelte'
	import { byCashFlowDashboard, transform } from '$lib/analytics/transforms'
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

	type StatVariant = 'plain' | 'income' | 'expense' | 'neutral' | 'highlight'

	let {
		transactions,
		baselineTransactions = [],
		currentRange = null,
		baselineRange = null,
		class: className,
		...rest
	}: Props = $props()

	const dashboard = $derived.by<CashFlowDashboard | undefined>(() => {
		if (transactions.length === 0) return undefined
		return transform(
			transactions,
			byCashFlowDashboard(baselineTransactions, {
				currentRange: currentRange ?? undefined,
				baselineRange,
			})
		)
	})

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}%`
	}

	const formatMetricValue = (metric: CashFlowKpi): string => {
		if (metric.unit === 'percent') return formatPercent(metric.value)
		return formatCurrency(metric.value)
	}

	const formatDelta = (metric: CashFlowKpi): string => {
		if (metric.delta.delta === null || metric.delta.baseline === null) {
			return 'No baseline period data'
		}

		const deltaValue = metric.delta.delta
		const sign = deltaValue > 0 ? '+' : ''
		const valueLabel =
			metric.unit === 'percent'
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
			{
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}
		)}%)`
	}

	const isFavorable = (metric: CashFlowKpi): boolean | null => {
		if (metric.delta.delta === null) return null
		if (metric.betterWhen === 'higher') return metric.delta.delta >= 0
		return metric.delta.delta <= 0
	}

	const metricVariant = (metric: CashFlowKpi): StatVariant => {
		const favorable = isFavorable(metric)
		if (favorable === null) return 'neutral'
		return favorable ? 'income' : 'expense'
	}

	let mixedCurrencyNotificationId = $state<string | undefined>(undefined)
	let mixedCurrencyNotificationText = $state<string | undefined>(undefined)

	$effect(() => {
		const currency = dashboard?.currency
		if (!currency?.mixedCurrency) {
			if (mixedCurrencyNotificationId) {
				dismissNotification(mixedCurrencyNotificationId)
			}
			mixedCurrencyNotificationId = undefined
			mixedCurrencyNotificationText = undefined
			return
		}

		const text = `Mixed currencies detected. Cash flow is displayed in ${currency.primaryCurrency}.`
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
	{#if !dashboard}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions for cash flow. Adjust filters or date range.
			</p>
		</Panel>
	{:else}
		<Panel title="Cash Flow Snapshot">
			<p class="mb-4 text-sm text-base-content/70">
				Current: {dashboard.currentRange.label}
				{#if dashboard.baselineRange}
					• Baseline: {dashboard.baselineRange.label}
				{/if}
			</p>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{#each dashboard.kpis as metric (metric.id)}
					<StatCard
						variant={metricVariant(metric)}
						title={metric.label}
						value={formatMetricValue(metric)}
						description={formatDelta(metric)}
					/>
				{/each}
			</div>
		</Panel>

		<Panel title="Inflow vs Outflow Trend">
			<p class="mb-3 text-sm text-base-content/70">
				Compares period income and expenses with net difference.
			</p>
			<IncomeExpenseComparisonChart timeSeries={dashboard.trend} />
		</Panel>

		<Panel title="Monthly Flow Decomposition">
			<p class="mb-3 text-sm text-base-content/70">
				Breaks monthly net flow into income, expense, debt, and buy/sell impact.
			</p>
			<ExperimentMonthlyWaterfall steps={dashboard.decomposition} />
		</Panel>

		<Panel title="Category Drivers">
			<p class="mb-3 text-sm text-base-content/70">
				Top inflow and outflow category shares for the current period.
			</p>
			<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<div>
					<p class="mb-2 text-sm font-semibold text-base-content/80">
						Inflow Categories
					</p>
					<IncomeBreakdownChart categoryData={dashboard.categoryDrivers} />
				</div>
				<div>
					<p class="mb-2 text-sm font-semibold text-base-content/80">
						Outflow Categories
					</p>
					<ExpenseBreakdownChart categoryData={dashboard.categoryDrivers} />
				</div>
			</div>
		</Panel>
	{/if}
</div>
