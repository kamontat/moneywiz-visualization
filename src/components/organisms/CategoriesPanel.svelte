<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type {
		ParsedTransaction,
		ParsedTransactionType,
	} from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import CategoryTreeView from '$components/molecules/CategoryTreeView.svelte'
	import ExpenseBreakdownChart from '$components/molecules/ExpenseBreakdownChart.svelte'
	import IncomeBreakdownChart from '$components/molecules/IncomeBreakdownChart.svelte'
	import TopPayeesPerCategoryChart from '$components/molecules/TopPayeesPerCategoryChart.svelte'
	import {
		byCategoryTotal,
		byCategoryTree,
		byTopPayeesPerCategory,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	let topPayeesType = $state<ParsedTransactionType>('Expense')
	let topN = $state(5)

	const expenseTree = $derived(
		transform(transactions, byCategoryTree('Expense'))
	)
	const incomeTree = $derived(transform(transactions, byCategoryTree('Income')))
	const categoryTotals = $derived(transform(transactions, byCategoryTotal))
	const topPayeesResult = $derived(
		transform(transactions, byTopPayeesPerCategory(topPayeesType, topN))
	)
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
			<Panel title="Income Breakdown">
				<IncomeBreakdownChart categoryData={categoryTotals} />
			</Panel>

			<Panel title="Expense Breakdown">
				<ExpenseBreakdownChart categoryData={categoryTotals} />
			</Panel>
		</div>

		<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
			<Panel title="Income Categories">
				<CategoryTreeView categoryTree={incomeTree} />
			</Panel>

			<Panel title="Expense Categories">
				<CategoryTreeView categoryTree={expenseTree} />
			</Panel>
		</div>

		<Panel title="Top Payees per Category">
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
