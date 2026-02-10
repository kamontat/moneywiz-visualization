<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import CategoryTreeView from '$components/molecules/CategoryTreeView.svelte'
	import ExpenseBreakdownChart from '$components/molecules/ExpenseBreakdownChart.svelte'
	import IncomeBreakdownChart from '$components/molecules/IncomeBreakdownChart.svelte'
	import {
		byCategoryTotal,
		byCategoryTree,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	const expenseTree = $derived(
		transform(transactions, byCategoryTree('Expense'))
	)
	const incomeTree = $derived(transform(transactions, byCategoryTree('Income')))
	const categoryTotals = $derived(transform(transactions, byCategoryTotal))
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if transactions.length === 0}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a CSV file to get started.
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
	{/if}
</div>
