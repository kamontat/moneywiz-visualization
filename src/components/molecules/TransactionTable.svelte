<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			limit?: number
		}>

	let {
		transactions,
		totalCount = 0,
		limit = 0,
		class: className,
	}: Props = $props()

	const baseClass = newTwClass(['w-full', 'overflow-x-auto'])
	let finalClass = $derived(mergeClass(baseClass, className))
</script>

<div class={finalClass}>
	{#if transactions.length > 0}
		{#if totalCount > 0}
			<span class="mt-6 block">Total transactions: {totalCount}</span>
		{/if}
		<div class="mt-4 overflow-x-auto">
			<table class="d-table w-full d-table-zebra">
				<thead>
					<tr>
						<th>Date</th>
						<th>Type</th>
						<th>Account</th>
						<th>Description</th>
						<th>Category</th>
						<th class="text-right">Amount</th>
					</tr>
				</thead>
				<tbody>
					{#each transactions as trx, i (trx.id ?? i)}
						<tr>
							<td class="whitespace-nowrap">
								{trx.date.toLocaleDateString('th-TH', {
									day: '2-digit',
									month: 'short',
									year: 'numeric',
								})}
							</td>
							<td>
								<span
									class="d-badge d-badge-sm"
									class:d-badge-error={trx.type === 'Expense'}
									class:d-badge-success={trx.type === 'Income'}
									class:d-badge-info={trx.type === 'Transfer'}
									class:d-badge-warning={trx.type === 'Refund'}
								>
									{trx.type}
								</span>
							</td>
							<td>{trx.account.name}</td>
							<td>{trx.description}</td>
							<td>
								{#if 'category' in trx && trx.category}
									{trx.category.category}
									{#if trx.category.subcategory}
										<span class="opacity-60">› {trx.category.subcategory}</span>
									{/if}
								{:else if 'transfer' in trx && trx.transfer}
									<span class="opacity-60">→ {trx.transfer.name}</span>
								{/if}
							</td>
							<td
								class="text-right font-mono"
								class:text-error={trx.amount.value < 0}
								class:text-success={trx.amount.value > 0}
							>
								{trx.amount.value.toLocaleString('th-TH', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
								<span class="text-xs opacity-60">{trx.amount.currency}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if limit > 0 && totalCount > limit}
			<p class="mt-2 text-sm opacity-60">
				Showing first {limit} of {totalCount} transactions
			</p>
		{/if}
	{:else}
		<div class="mt-6 text-center opacity-60">
			<p>No transactions loaded</p>
			<p class="text-sm">Upload a MoneyWiz CSV file to get started</p>
		</div>
	{/if}
</div>
