<script lang="ts">
	import type { FilterState as BaseFilterState } from '$lib/analytics/filters/models/state'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import ChevronDown from '@iconify-svelte/lucide/chevron-down'
	import FolderIcon from '@iconify-svelte/lucide/folder'
	import HashIcon from '@iconify-svelte/lucide/hash'
	import ListFilterIcon from '@iconify-svelte/lucide/list-filter'
	import X from '@iconify-svelte/lucide/x'

	import Button from '$components/atoms/Button.svelte'
	import { hasActiveFilters } from '$lib/analytics/filters/models/state'
	import { mergeClass } from '$lib/components'

	type FilterState = BaseFilterState & { categories: string[] }

	type TagCategory = {
		category: string
		tags: string[]
	}

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
	const getCategoryActiveCount = (categoryName: string): number => {
		const tagFilter = filterState.tags.find(
			(tag) => tag.category === categoryName
		)
		return tagFilter?.values.length ?? 0
	}

	const chipBase = [
		'd-btn',
		'd-btn-sm',
		'gap-1.5',
		'rounded-full',
		'border',
		'bg-base-100',
		'font-medium',
		'shadow-sm',
		'transition-all',
		'hover:shadow-md',
		'min-h-0',
		'h-8',
	]

	const chipActiveClass =
		'border-primary/40 text-primary hover:border-primary/60'
	const chipInactiveClass =
		'border-base-300 text-base-content/70 hover:border-base-content/30'
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
	<button
		type="button"
		class={mergeClass(
			chipBase,
			hasDateFilter ? chipActiveClass : chipInactiveClass
		)}
		aria-expanded={openPanel === 'date'}
		onclick={() => ontogglepanel?.('date')}
	>
		<CalendarIcon class="size-3.5" />
		<span class="text-xs">Date</span>
		<ChevronDown
			class={mergeClass(
				['size-3', 'transition-transform', 'duration-200'],
				openPanel === 'date' ? 'rotate-180' : undefined
			)}
		/>
	</button>

	<button
		type="button"
		class={mergeClass(
			chipBase,
			hasTypeFilter ? chipActiveClass : chipInactiveClass
		)}
		aria-expanded={openPanel === 'types'}
		onclick={() => ontogglepanel?.('types')}
	>
		<ListFilterIcon class="size-3.5" />
		<span class="text-xs">Types</span>
		{#if hasTypeFilter}
			<span
				class="d-badge min-h-0 min-w-4 d-badge-xs text-[10px] d-badge-primary"
			>
				{filterState.transactionTypes.length}
			</span>
		{/if}
		<ChevronDown
			class={mergeClass(
				['size-3', 'transition-transform', 'duration-200'],
				openPanel === 'types' ? 'rotate-180' : undefined
			)}
		/>
	</button>

	<button
		type="button"
		class={mergeClass(
			chipBase,
			hasCategoryFilter ? chipActiveClass : chipInactiveClass
		)}
		aria-expanded={openPanel === 'category'}
		onclick={() => ontogglepanel?.('category')}
	>
		<FolderIcon class="size-3.5" />
		<span class="text-xs">Category</span>
		{#if hasCategoryFilter}
			<span
				class="d-badge min-h-0 min-w-4 d-badge-xs text-[10px] d-badge-primary"
			>
				{filterState.categories.length}
			</span>
		{/if}
		<ChevronDown
			class={mergeClass(
				['size-3', 'transition-transform', 'duration-200'],
				openPanel === 'category' ? 'rotate-180' : undefined
			)}
		/>
	</button>

	{#each availableTagCategories as tagCategory (tagCategory.category)}
		{@const activeCount = getCategoryActiveCount(tagCategory.category)}
		<button
			type="button"
			class={mergeClass(
				chipBase,
				activeCount > 0 ? chipActiveClass : chipInactiveClass
			)}
			aria-expanded={openPanel === tagCategory.category}
			onclick={() => ontogglepanel?.(tagCategory.category)}
		>
			<HashIcon class="size-3.5" />
			<span class="text-xs">{tagCategory.category}</span>
			{#if activeCount > 0}
				<span
					class="d-badge min-h-0 min-w-4 d-badge-xs text-[10px] d-badge-primary"
				>
					{activeCount}
				</span>
			{/if}
			<ChevronDown
				class={mergeClass(
					['size-3', 'transition-transform', 'duration-200'],
					openPanel === tagCategory.category ? 'rotate-180' : undefined
				)}
			/>
		</button>
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
