<script lang="ts">
	import type {
		FilterState,
		TagCategory,
	} from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import FolderIcon from '@iconify-svelte/lucide/folder'
	import HashIcon from '@iconify-svelte/lucide/hash'
	import ListFilterIcon from '@iconify-svelte/lucide/list-filter'
	import UserIcon from '@iconify-svelte/lucide/user'
	import WalletIcon from '@iconify-svelte/lucide/wallet'
	import X from '@iconify-svelte/lucide/x'

	import Button from '$components/atoms/Button.svelte'
	import FilterChipButton from '$components/atoms/FilterChipButton.svelte'
	import { hasActiveFilters } from '$lib/analytics/filters/models/state'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableTagCategories: TagCategory[]
			openPanel: string | null
			ontogglepanel?: (panel: string) => void
			onclearfilters?: () => void
		}>

	let {
		filterState,
		availableTagCategories = [],
		openPanel = null,
		ontogglepanel,
		onclearfilters,
		class: className,
		...rest
	}: Props = $props()

	const isActive = $derived(hasActiveFilters(filterState))
	const hasDateFilter = $derived(
		!!(filterState.dateRange.start || filterState.dateRange.end)
	)
	const hasTypeFilter = $derived(filterState.transactionTypes.length > 0)
	const hasCategoryFilter = $derived(filterState.categories.length > 0)
	const hasPayeeFilter = $derived(filterState.payees.length > 0)
	const hasAccountFilter = $derived(filterState.accounts.length > 0)
	const getCategoryActiveCount = (categoryName: string): number => {
		const tagFilter = filterState.tags.find(
			(tag) => tag.category === categoryName
		)
		return tagFilter?.values.length ?? 0
	}
</script>

<div
	class={mergeClass(
		[
			'flex',
			'items-center',
			'gap-2',
			'overflow-x-auto',
			'rounded-lg',
			'bg-base-200/40',
			'px-3',
			'py-2',
		],
		className
	)}
	{...rest}
>
	<!-- Group 1: Dates, Types -->
	<FilterChipButton
		label="Dates"
		active={hasDateFilter}
		expanded={openPanel === 'date'}
		aria-expanded={openPanel === 'date'}
		onclick={() => ontogglepanel?.('date')}
	>
		{#snippet icon()}
			<CalendarIcon class="size-3.5" />
		{/snippet}
	</FilterChipButton>

	<FilterChipButton
		label="Types"
		active={hasTypeFilter}
		expanded={openPanel === 'types'}
		count={filterState.transactionTypes.length}
		aria-expanded={openPanel === 'types'}
		onclick={() => ontogglepanel?.('types')}
	>
		{#snippet icon()}
			<ListFilterIcon class="size-3.5" />
		{/snippet}
	</FilterChipButton>

	<!-- Separator between Group 1 and Group 2 -->
	<div class="h-5 w-px bg-base-content/20"></div>

	<!-- Group 2: Categories, Payees, Accounts -->
	<FilterChipButton
		label="Categories"
		active={hasCategoryFilter}
		expanded={openPanel === 'category'}
		count={filterState.categories.length}
		aria-expanded={openPanel === 'category'}
		onclick={() => ontogglepanel?.('category')}
	>
		{#snippet icon()}
			<FolderIcon class="size-3.5" />
		{/snippet}
	</FilterChipButton>

	<FilterChipButton
		label="Payees"
		active={hasPayeeFilter}
		expanded={openPanel === 'payee'}
		count={filterState.payees.length}
		aria-expanded={openPanel === 'payee'}
		onclick={() => ontogglepanel?.('payee')}
		data-testid="filter-payee-chip"
	>
		{#snippet icon()}
			<UserIcon class="size-3.5" />
		{/snippet}
	</FilterChipButton>

	<FilterChipButton
		label="Accounts"
		active={hasAccountFilter}
		expanded={openPanel === 'account'}
		count={filterState.accounts.length}
		aria-expanded={openPanel === 'account'}
		onclick={() => ontogglepanel?.('account')}
		data-testid="filter-account-chip"
	>
		{#snippet icon()}
			<WalletIcon class="size-3.5" />
		{/snippet}
	</FilterChipButton>

	<!-- Separator between Group 2 and Group 3 (only if tag categories exist) -->
	{#if availableTagCategories.length > 0}
		<div class="h-5 w-px bg-base-content/20"></div>
	{/if}

	<!-- Group 3: Tag categories -->
	{#each availableTagCategories as tagCategory (tagCategory.category)}
		{@const activeCount = getCategoryActiveCount(tagCategory.category)}
		<FilterChipButton
			label={tagCategory.category}
			active={activeCount > 0}
			expanded={openPanel === tagCategory.category}
			count={activeCount}
			aria-expanded={openPanel === tagCategory.category}
			onclick={() => ontogglepanel?.(tagCategory.category)}
		>
			{#snippet icon()}
				<HashIcon class="size-3.5" />
			{/snippet}
		</FilterChipButton>
	{/each}

	<div class="flex-1"></div>

	{#if isActive}
		<Button
			variant="ghost"
			class="h-7 min-h-0 gap-1 text-base-content/60 d-btn-xs hover:text-base-content"
			onclick={() => onclearfilters?.()}
		>
			<X class="size-3" />
			<span class="text-xs">Clear</span>
		</Button>
	{/if}
</div>
