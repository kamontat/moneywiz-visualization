<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { mergeClass, newTwClass } from '$lib/components'
	import { formatAmount } from '$lib/formatters/amount'
	import { formatDate } from '$lib/formatters/date'
	import { formatTransactionType } from '$lib/formatters/transactionType'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			page?: number
			pageSize?: number
		}>

	let {
		transactions,
		totalCount = 0,
		page = 1,
		pageSize = 10,
		class: className,
	}: Props = $props()

	const stripNumberPrefix = (name: string): string =>
		name.replace(/^\d+\s+/, '')

	const baseClass = newTwClass(['w-full'])
	let finalClass = $derived(mergeClass(baseClass, className))
	const pageStart = $derived.by(() => {
		if (transactions.length === 0 || totalCount === 0) return 0
		const safePage = Math.max(1, Math.trunc(page))
		const safePageSize = Math.max(1, Math.trunc(pageSize))
		return (safePage - 1) * safePageSize + 1
	})
	const pageEnd = $derived.by(() => {
		if (transactions.length === 0 || totalCount === 0) return 0
		return Math.min(totalCount, pageStart + transactions.length - 1)
	})
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
				<tbody class="divide-y divide-base-300">
					{#each transactions as trx, i (trx.id ?? i)}
						<tr class="transition-colors duration-150 hover:bg-base-200/30">
							<td class="py-3 text-sm whitespace-nowrap">
								{formatDate(trx.date)}
							</td>
							<td class="py-3">
								<span
									class="d-badge border-0 d-badge-sm font-medium whitespace-nowrap"
									class:bg-cyan-200={trx.type === 'Buy'}
									class:text-cyan-900={trx.type === 'Buy'}
									class:bg-red-200={trx.type === 'Expense'}
									class:text-red-900={trx.type === 'Expense'}
									class:bg-indigo-200={trx.type === 'Sell'}
									class:text-indigo-900={trx.type === 'Sell'}
									class:bg-emerald-200={trx.type === 'Income'}
									class:text-emerald-900={trx.type === 'Income'}
									class:bg-sky-200={trx.type === 'Transfer'}
									class:text-sky-900={trx.type === 'Transfer'}
									class:bg-slate-100={trx.type === 'Reconcile'}
									class:text-slate-800={trx.type === 'Reconcile'}
									class:bg-amber-100={trx.type === 'Refund'}
									class:text-amber-800={trx.type === 'Refund'}
									class:bg-orange-50={trx.type === 'Debt'}
									class:text-orange-700={trx.type === 'Debt'}
									class:bg-lime-50={trx.type === 'DebtRepayment'}
									class:text-lime-700={trx.type === 'DebtRepayment'}
									class:bg-teal-50={trx.type === 'Windfall'}
									class:text-teal-700={trx.type === 'Windfall'}
									class:bg-fuchsia-50={trx.type === 'Giveaway'}
									class:text-fuchsia-700={trx.type === 'Giveaway'}
									class:bg-zinc-200={trx.type === 'Unknown'}
									class:text-zinc-800={trx.type === 'Unknown'}
								>
									{formatTransactionType(trx.type)}
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
										<span class="text-base-content/60">
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
									{formatAmount(trx.amount)}
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
				{pageStart.toLocaleString()}
			</span>
			-
			<span class="font-medium text-base-content">
				{pageEnd.toLocaleString()}
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
				Upload a MoneyWiz database file to get started
			</p>
		</div>
	{/if}
</div>
