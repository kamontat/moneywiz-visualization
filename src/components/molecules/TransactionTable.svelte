<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { mergeClass, newTwClass } from '$lib/components'
	import { formatDate } from '$lib/formatters/date'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
		}>

	let { transactions, totalCount = 0, class: className }: Props = $props()

	const stripNumberPrefix = (name: string): string =>
		name.replace(/^\d+\s+/, '')

	const baseClass = newTwClass(['w-full'])
	let finalClass = $derived(mergeClass(baseClass, className))
</script>

<div class={finalClass}>
	{#if transactions.length > 0}
		<div class="overflow-x-auto rounded-lg">
			<table class="d-table w-full">
				<thead class="bg-base-200/50">
					<tr>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Date
						</th>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Type
						</th>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Account
						</th>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Description
						</th>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Category
						</th>
						<th
							class="text-right text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Amount
						</th>
						<th
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Tags
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-base-200">
					{#each transactions as trx, i (trx.id ?? i)}
						<tr class="transition-colors duration-150 hover:bg-base-200/30">
							<td class="py-3 text-sm whitespace-nowrap">
								{formatDate(trx.date)}
							</td>
							<td class="py-3">
								<span
									class="d-badge d-badge-sm font-medium"
									class:d-badge-error={trx.type === 'Expense'}
									class:d-badge-success={trx.type === 'Income'}
									class:d-badge-info={trx.type === 'Transfer'}
									class:d-badge-warning={trx.type === 'Refund'}
								>
									{trx.type}
								</span>
							</td>
							<td class="py-3 text-sm whitespace-nowrap text-base-content/80"
								>{trx.account.name}</td
							>
							<td class="max-w-xs truncate py-3 text-sm font-medium">
								{trx.description}
							</td>
							<td class="py-3 text-sm">
								{#if 'category' in trx && trx.category}
									<span class="text-base-content/80"
										>{trx.category.category}</span
									>
									{#if trx.category.subcategory}
										<span class="text-base-content/50">
											› {trx.category.subcategory}
										</span>
									{/if}
								{:else if 'transfer' in trx && trx.transfer}
									<span class="text-info">→ {trx.transfer.name}</span>
								{/if}
							</td>
							<td
								class="py-3 text-right font-mono text-sm font-medium whitespace-nowrap"
							>
								<span
									class:text-error={trx.amount.value < 0}
									class:text-success={trx.amount.value > 0}
								>
									{trx.amount.value.toLocaleString('th-TH', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
								<span class="ml-1 text-xs text-base-content/50">
									{trx.amount.currency}
								</span>
							</td>
							<td class="py-3">
								{#if trx.tags.length > 0}
									<div class="flex flex-wrap gap-1.5">
										{#each trx.tags as tag (tag.category + ':' + tag.name)}
											<span
												class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200/50 px-2 py-0.5 text-xs text-base-content/80 transition-colors hover:bg-base-200"
											>
												<span class="text-primary/60">#</span>
												{stripNumberPrefix(tag.name)}
											</span>
										{/each}
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-4 text-sm text-base-content/60">
			Showing
			<span class="font-medium text-base-content">
				{Math.min(transactions.length, totalCount)}
			</span>
			of
			<span class="font-medium text-base-content">
				{totalCount.toLocaleString()}
			</span>
			transactions
		</p>
	{:else}
		<div class="py-12 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200"
			>
				<span class="text-2xl">💳</span>
			</div>
			<p class="text-lg font-semibold text-base-content">No transactions</p>
			<p class="mt-1 text-sm text-base-content/60">
				Upload a MoneyWiz CSV file to get started
			</p>
		</div>
	{/if}
</div>
