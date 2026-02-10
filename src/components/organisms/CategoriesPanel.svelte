<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import CategoryTreeView from '$components/molecules/CategoryTreeView.svelte'
	import { byCategoryTree, transform } from '$lib/analytics/transforms'
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
</script>

<div
	class={mergeClass(
		['grid', 'grid-cols-1', 'gap-6', 'xl:grid-cols-2'],
		className
	)}
	{...rest}
>
	{#if transactions.length === 0}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a CSV file to get started.
			</p>
		</Panel>
	{:else}
		<Panel title="Expense Categories">
			<CategoryTreeView categoryTree={expenseTree} />
		</Panel>

		<Panel title="Income Categories">
			<CategoryTreeView categoryTree={incomeTree} />
		</Panel>
	{/if}
</div>
