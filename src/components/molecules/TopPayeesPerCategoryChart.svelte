<script lang="ts">
	import type { TopPayeesPerCategoryResult } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			result: TopPayeesPerCategoryResult
		}>

	let { result, class: className, ...rest }: Props = $props()

	let userSelectedCategory = $state<string | undefined>()
	let searchQuery = $state('')

	const filteredGroups = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase()
		if (!q) return result.groups
		return result.groups.filter(
			(g) =>
				g.category.toLowerCase().includes(q) ||
				g.topPayees.some((p) => p.payee.toLowerCase().includes(q))
		)
	})

	const selectedCategory = $derived.by(() => {
		if (
			userSelectedCategory &&
			result.groups.some((g) => g.category === userSelectedCategory)
		) {
			return userSelectedCategory
		}
		return result.groups[0]?.category
	})

	const selectedGroup = $derived(
		result.groups.find((g) => g.category === selectedCategory)
	)

	const maxGroupAmount = $derived(
		result.groups.length > 0 ? result.groups[0].totalAmount : 1
	)

	const formatShare = (share: number): string =>
		`${share.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

	const getBarWidth = (amount: number, groupTotal: number): string => {
		if (groupTotal === 0) return '0%'
		return `${Math.min(100, (amount / groupTotal) * 100).toFixed(1)}%`
	}

	const getCategoryBarWidth = (amount: number): string => {
		if (maxGroupAmount === 0) return '0%'
		return `${Math.min(100, (amount / maxGroupAmount) * 100).toFixed(1)}%`
	}

	const PALETTE = [
		'#6366f1',
		'#f59e0b',
		'#10b981',
		'#ef4444',
		'#8b5cf6',
		'#06b6d4',
		'#f97316',
		'#ec4899',
		'#14b8a6',
		'#84cc16',
	]

	const getColor = (index: number): string => PALETTE[index % PALETTE.length]
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if result.groups.length === 0}
		<p class="py-8 text-center text-sm text-base-content/60">
			No data available for this transaction type.
		</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
			<!-- Left: Category List -->
			<div class="xl:col-span-2">
				<div class="mb-3">
					<input
						type="search"
						placeholder="Search categories or payees…"
						bind:value={searchQuery}
						class="d-input d-input-sm w-full border-base-300 bg-base-100/60 text-sm focus:border-primary"
					/>
				</div>

				<div
					class="flex flex-col gap-1.5 overflow-y-auto"
					style="max-height: 480px"
				>
					{#each filteredGroups as group, i (group.category)}
						{@const isSelected = selectedCategory === group.category}
						<button
							type="button"
							onclick={() => (userSelectedCategory = group.category)}
							class={mergeClass(
								[
									'group',
									'w-full',
									'rounded-box',
									'border',
									'p-3',
									'text-left',
									'transition-all',
									'duration-150',
									'hover:border-primary/40',
									'hover:bg-primary/5',
								],
								isSelected
									? 'border-primary/50 bg-primary/10'
									: 'border-base-300/60 bg-base-100/40'
							)}
						>
							<div class="flex items-center justify-between gap-2">
								<div class="min-w-0 flex-1">
									<p
										class={mergeClass(
											['truncate', 'text-sm', 'font-medium'],
											isSelected
												? 'text-primary'
												: 'text-base-content group-hover:text-primary'
										)}
									>
										{group.category}
									</p>
									<p class="mt-0.5 text-xs text-base-content/50">
										{group.topPayees.length} payee{group.topPayees.length !== 1
											? 's'
											: ''}
									</p>
								</div>
								<div class="shrink-0 text-right">
									<p
										class={mergeClass(
											['text-sm', 'font-semibold', 'tabular-nums'],
											isSelected ? 'text-primary' : 'text-base-content'
										)}
									>
										{formatCurrency(group.totalAmount)}
									</p>
								</div>
							</div>

							<div
								class="mt-2 h-1 w-full overflow-hidden rounded-full bg-base-300/60"
							>
								<div
									class={mergeClass(
										[
											'h-full',
											'rounded-full',
											'transition-all',
											'duration-300',
										],
										isSelected ? 'opacity-100' : 'opacity-60'
									)}
									style="width: {getCategoryBarWidth(
										group.totalAmount
									)}; background-color: {getColor(i)}"
								></div>
							</div>
						</button>
					{/each}

					{#if filteredGroups.length === 0}
						<p class="py-6 text-center text-sm text-base-content/50">
							No results for "{searchQuery}"
						</p>
					{/if}
				</div>
			</div>

			<!-- Right: Payee Detail -->
			<div class="xl:col-span-3">
				{#if selectedGroup}
					<div
						class="rounded-box border border-base-300/60 bg-base-100/40 p-4 sm:p-5"
					>
						<div class="mb-4 flex flex-wrap items-start justify-between gap-2">
							<div>
								<h4 class="text-base font-semibold text-base-content">
									{selectedGroup.category}
								</h4>
								<p class="mt-0.5 text-xs text-base-content/50">
									Top {selectedGroup.topPayees.length} of {result.topN} payees by
									spend
								</p>
							</div>
							<div class="text-right">
								<p class="text-xs text-base-content/50">Category total</p>
								<p class="text-lg font-bold text-base-content">
									{formatCurrency(selectedGroup.totalAmount)}
								</p>
							</div>
						</div>

						<div class="flex flex-col gap-3">
							{#each selectedGroup.topPayees as payee, pi (payee.payee)}
								<div class="group/payee">
									<div class="mb-1 flex items-center justify-between gap-2">
										<div class="flex min-w-0 items-center gap-2">
											<span
												class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
												style="background-color: {getColor(pi)}"
											>
												{pi + 1}
											</span>
											<span
												class="truncate text-sm font-medium text-base-content"
											>
												{payee.payee}
											</span>
										</div>
										<div class="shrink-0 text-right">
											<span
												class="text-sm font-semibold text-base-content tabular-nums"
											>
												{formatCurrency(payee.amount)}
											</span>
										</div>
									</div>

									<div class="flex items-center gap-2">
										<div
											class="h-2 flex-1 overflow-hidden rounded-full bg-base-300/60"
										>
											<div
												class="h-full rounded-full transition-all duration-500"
												style="width: {getBarWidth(
													payee.amount,
													selectedGroup.totalAmount
												)}; background-color: {getColor(pi)}"
											></div>
										</div>
										<div
											class="flex shrink-0 items-center gap-2 text-xs text-base-content/50"
										>
											<span class="tabular-nums"
												>{formatShare(payee.share)}</span
											>
											<span class="hidden sm:inline">·</span>
											<span class="hidden tabular-nums sm:inline">
												{payee.transactionCount}
												{payee.transactionCount === 1 ? 'txn' : 'txns'}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>

						{#if selectedGroup.topPayees.length === 0}
							<p class="py-6 text-center text-sm text-base-content/50">
								No payee data for this category.
							</p>
						{/if}
					</div>
				{:else}
					<div
						class="flex h-full min-h-48 items-center justify-center rounded-box border border-dashed border-base-300 text-sm text-base-content/40"
					>
						Select a category to see top payees
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
