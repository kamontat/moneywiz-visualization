<script lang="ts">
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { onMount } from 'svelte'

	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import { csvStore } from '$lib/csv'
	import { getTransactionCount, getTransactions } from '$lib/transactions'

	let transactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)

	const loadTransactions = async () => {
		totalCount = await getTransactionCount()
		transactions = await getTransactions(20)
	}

	onMount(() => {
		loadTransactions()
		csvStore.subscribe(() => {
			loadTransactions()
		})
	})
</script>

<AppBody>
	<BodyHeader />

	{#if totalCount > 0}
		<span class="mt-6">Total transactions: {totalCount}</span>
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
		{#if totalCount > 20}
			<p class="mt-2 text-sm opacity-60">
				Showing first 20 of {totalCount} transactions
			</p>
		{/if}
	{:else}
		<div class="mt-6 text-center opacity-60">
			<p>No transactions loaded</p>
			<p class="text-sm">Upload a MoneyWiz CSV file to get started</p>
		</div>
	{/if}
</AppBody>
