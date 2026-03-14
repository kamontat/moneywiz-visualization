<script lang="ts">
	import type { ChartData } from 'chart.js'
	import type { ParsedTransaction, ParsedTransactionType } from '$lib/types'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import Panel from '$components/atoms/Panel.svelte'
	import CategoryTreeView from '$components/molecules/CategoryTreeView.svelte'
	import ExpenseBreakdownChart from '$components/molecules/ExpenseBreakdownChart.svelte'
	import IncomeBreakdownChart from '$components/molecules/IncomeBreakdownChart.svelte'
	import PayeeSpendInsightsChart from '$components/molecules/PayeeSpendInsightsChart.svelte'
	import TopPayeesPerCategoryChart from '$components/molecules/TopPayeesPerCategoryChart.svelte'
	import { buildDriversPanelData } from '$lib/app/dashboard'
	import {
		getCategoryPalette,
		horizontalBarChartOptions,
		mergeClass,
	} from '$lib/ui'
	import { formatCurrency } from '$lib/utils'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	let topPayeesType = $state<ParsedTransactionType>('Expense')
	let topN = $state(5)

	const drivers = $derived(
		buildDriversPanelData(transactions, topPayeesType, topN)
	)
	const expenseTree = $derived(drivers.expenseTree)
	const incomeTree = $derived(drivers.incomeTree)
	const categoryTotals = $derived(drivers.categoryTotals)
	const payeeSpend = $derived(drivers.payeeSpend)
	const topPayeesResult = $derived(drivers.topPayeesResult)
	const concentration = $derived(drivers.concentration)

	const concentrationChartData = $derived.by<ChartData<'bar'>>(() => {
		if (concentration.topCategories.length === 0) {
			return { labels: [], datasets: [] }
		}

		const colors = getCategoryPalette(concentration.topCategories.length)
		return {
			labels: concentration.topCategories.map((entry) => entry.name),
			datasets: [
				{
					label: 'Share',
					data: concentration.topCategories.map((entry) => entry.share),
					backgroundColor: colors,
					borderWidth: 0,
				},
			],
		}
	})

	const concentrationOptions = $derived(horizontalBarChartOptions())

	const concentrationLabel = (hhi: number): string => {
		if (hhi >= 0.25) return 'High concentration'
		if (hhi >= 0.15) return 'Moderate concentration'
		return 'Diversified'
	}

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		})}%`
	}
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if transactions.length === 0}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a database file to get started.
			</p>
		</Panel>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<Panel
				title="Income Mix"
				question="Distribution of income totals across categories."
			>
				<IncomeBreakdownChart categoryData={categoryTotals} />
			</Panel>

			<Panel
				title="Expense Mix"
				question="Distribution of expense totals across categories."
			>
				<ExpenseBreakdownChart categoryData={categoryTotals} />
			</Panel>
		</div>

		<Panel
			title="Category Concentration"
			question="Spending concentration by expense category with HHI context."
		>
			<div class="grid grid-cols-1 gap-6 2xl:grid-cols-2">
				<div>
					<p class="mb-3 text-sm text-base-content/70">
						Expense categories: {concentrationLabel(concentration.hhi)}
						(HHI {concentration.hhi.toFixed(3)})
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

				<div class="overflow-x-auto">
					<table class="d-table d-table-zebra">
						<thead>
							<tr>
								<th>Category</th>
								<th class="text-right">Amount</th>
								<th class="text-right">Share</th>
							</tr>
						</thead>
						<tbody>
							{#each concentration.topCategories as item (item.name)}
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
		</Panel>

		<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
			<Panel
				title="Income Categories"
				question="Income category hierarchy by parent and subcategory."
			>
				<CategoryTreeView categoryTree={incomeTree} />
			</Panel>

			<Panel
				title="Expense Categories"
				question="Expense category hierarchy by parent and subcategory."
			>
				<CategoryTreeView categoryTree={expenseTree} />
			</Panel>
		</div>

		<Panel
			title="Payee Spend Insights"
			question="Top payees by net spend with interactive trend details."
		>
			<PayeeSpendInsightsChart analysis={payeeSpend} />
		</Panel>

		<Panel
			title="Top Payees per Category"
			question="Highest-impact payees within each selected category."
		>
			<div class="mb-4 flex flex-wrap items-center gap-3">
				<div class="d-join">
					<button
						type="button"
						class="d-btn d-join-item d-btn-sm {topPayeesType === 'Expense'
							? 'd-btn-primary'
							: 'd-btn-ghost'}"
						onclick={() => (topPayeesType = 'Expense')}
					>
						Expenses
					</button>
					<button
						type="button"
						class="d-btn d-join-item d-btn-sm {topPayeesType === 'Income'
							? 'd-btn-primary'
							: 'd-btn-ghost'}"
						onclick={() => (topPayeesType = 'Income')}
					>
						Income
					</button>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-base-content/60">Top N:</span>
					<div class="d-join">
						{#each [3, 5, 10] as n (n)}
							<button
								type="button"
								class="d-btn d-join-item d-btn-sm {topN === n
									? 'd-btn-primary'
									: 'd-btn-ghost'}"
								onclick={() => (topN = n)}
							>
								{n}
							</button>
						{/each}
					</div>
				</div>
			</div>
			<TopPayeesPerCategoryChart result={topPayeesResult} />
		</Panel>
	{/if}
</div>
