<script lang="ts">
	import type {
		FilterState as BaseFilterState,
		TagFilter,
	} from '$lib/analytics/filters/models/state'
	import type { FilterTagMode } from '$lib/analytics/filters/models/tags'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type {
		ParsedCategory,
		ParsedTransactionType,
	} from '$lib/transactions/models'
	import { SvelteMap } from 'svelte/reactivity'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import ChevronDown from '@iconify-svelte/lucide/chevron-down'
	import FolderIcon from '@iconify-svelte/lucide/folder'
	import HashIcon from '@iconify-svelte/lucide/hash'
	import ListFilterIcon from '@iconify-svelte/lucide/list-filter'
	import SearchIcon from '@iconify-svelte/lucide/search'
	import X from '@iconify-svelte/lucide/x'

	import Button from '$components/atoms/Button.svelte'
	import { hasActiveFilters } from '$lib/analytics/filters/models/state'
	import { mergeClass } from '$lib/components'
	import { getCategoryFullName } from '$lib/transactions/utils'

	type FilterState = BaseFilterState & { categories: string[] }

	type TagCategory = {
		category: string
		tags: string[]
	}

	type CategoryOption = {
		fullName: string
		displayName: string
		category: string
		subcategory: string
	}

	type CategoryGroup = {
		name: string
		options: CategoryOption[]
	}

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableCategories: ParsedCategory[]
			availableTagCategories: TagCategory[]
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availableCategories = [],
		availableTagCategories = [],
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	// Only core transaction types — special types removed
	const transactionTypes: ParsedTransactionType[] = [
		'Expense',
		'Income',
		'Refund',
		'Transfer',
	]

	// Track which filter panel is open (null = all closed)
	let openPanel = $state<string | null>(null)
	let categoryQuery = $state('')
	let tagQueries = $state<Record<string, string>>({})

	const isActive = $derived(hasActiveFilters(filterState))

	// --- Chip active state helpers ---

	const hasDateFilter = $derived(
		!!(filterState.dateRange.start || filterState.dateRange.end)
	)
	const hasTypeFilter = $derived(filterState.transactionTypes.length > 0)
	const hasCategoryFilter = $derived(filterState.categories.length > 0)
	const getCategoryActiveCount = (categoryName: string): number => {
		return getSelectedTags(categoryName).length
	}

	const categoryOptions = $derived.by(() => {
		const options: CategoryOption[] = availableCategories.map((cat) => {
			const fullName = getCategoryFullName(cat)
			return {
				fullName,
				displayName: fullName.trim() ? fullName : 'Uncategorized',
				category: cat.category,
				subcategory: cat.subcategory,
			}
		})
		const query = categoryQuery.trim().toLowerCase()
		if (!query) return options
		return options.filter((option) =>
			option.displayName.toLowerCase().includes(query)
		)
	})

	const categoryGroups = $derived.by(() => {
		const groups = new SvelteMap<string, CategoryOption[]>()
		for (const option of categoryOptions) {
			const name = option.category.trim() ? option.category : 'Uncategorized'
			const entries = groups.get(name) ?? []
			entries.push(option)
			groups.set(name, entries)
		}
		return Array.from(groups.entries(), ([name, options]) => ({
			name,
			options,
		}))
	})

	const categorySubGroups = $derived.by(() => {
		return categoryGroups
			.map((group) => ({
				...group,
				options: group.options.filter((option) => option.subcategory.trim()),
			}))
			.filter((group) => group.options.length > 0)
	})

	// --- Date helpers ---

	const formatDate = (date: Date | undefined): string => {
		if (!date) return ''
		return date.toISOString().split('T')[0]
	}

	const parseDate = (value: string): Date | undefined => {
		if (!value) return undefined
		const date = new Date(value)
		return isNaN(date.getTime()) ? undefined : date
	}

	const handleStartDateChange = (e: Event) => {
		const input = e.target as HTMLInputElement
		filterState = {
			...filterState,
			dateRange: {
				...filterState.dateRange,
				start: parseDate(input.value),
			},
		}
		onfilterchange?.(filterState)
	}

	const handleEndDateChange = (e: Event) => {
		const input = e.target as HTMLInputElement
		filterState = {
			...filterState,
			dateRange: {
				...filterState.dateRange,
				end: parseDate(input.value),
			},
		}
		onfilterchange?.(filterState)
	}

	// --- Quick date presets ---

	type DatePreset = { label: string; start: Date; end: Date }

	const getDatePresets = (): DatePreset[] => {
		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth()

		return [
			{
				label: 'This Month',
				start: new Date(year, month, 1),
				end: new Date(year, month + 1, 0, 23, 59, 59, 999),
			},
			{
				label: 'Last Month',
				start: new Date(year, month - 1, 1),
				end: new Date(year, month, 0, 23, 59, 59, 999),
			},
			{
				label: 'This Year',
				start: new Date(year, 0, 1),
				end: new Date(year, 11, 31, 23, 59, 59, 999),
			},
			{
				label: 'Last Year',
				start: new Date(year - 1, 0, 1),
				end: new Date(year - 1, 11, 31, 23, 59, 59, 999),
			},
		]
	}

	const applyDatePreset = (preset: DatePreset) => {
		if (isPresetActive(preset)) {
			filterState = {
				...filterState,
				dateRange: { start: undefined, end: undefined },
			}
		} else {
			filterState = {
				...filterState,
				dateRange: {
					start: preset.start,
					end: preset.end,
				},
			}
		}
		onfilterchange?.(filterState)
	}

	const isPresetActive = (preset: DatePreset): boolean => {
		const { start, end } = filterState.dateRange
		if (!start || !end) return false
		return (
			formatDate(start) === formatDate(preset.start) &&
			formatDate(end) === formatDate(preset.end)
		)
	}

	// --- Transaction type ---

	const toggleTransactionType = (type: ParsedTransactionType) => {
		const current = filterState.transactionTypes
		const updated = current.includes(type)
			? current.filter((t) => t !== type)
			: [...current, type]
		filterState = {
			...filterState,
			transactionTypes: updated,
		}
		onfilterchange?.(filterState)
	}

	// --- Categories ---

	const toggleCategory = (category: string) => {
		const current = filterState.categories
		const updated = current.includes(category)
			? current.filter((c: string) => c !== category)
			: [...current, category]
		filterState = {
			...filterState,
			categories: updated,
		}
		onfilterchange?.(filterState)
	}

	const toggleCategoryGroup = (group: CategoryGroup) => {
		const groupNames = group.options.map((option) => option.fullName)
		if (groupNames.length === 0) return
		const allSelected = groupNames.every((name) =>
			filterState.categories.includes(name)
		)
		const updated = allSelected
			? filterState.categories.filter((name) => !groupNames.includes(name))
			: Array.from(new Set([...filterState.categories, ...groupNames]))
		filterState = {
			...filterState,
			categories: updated,
		}
		onfilterchange?.(filterState)
	}

	const clearCategoryGroup = (group: CategoryGroup) => {
		const groupNames = group.options.map((option) => option.fullName)
		if (groupNames.length === 0) return
		filterState = {
			...filterState,
			categories: filterState.categories.filter(
				(name) => !groupNames.includes(name)
			),
		}
		onfilterchange?.(filterState)
	}

	const clearCategoryFilter = () => {
		filterState = {
			...filterState,
			categories: [],
		}
		onfilterchange?.(filterState)
	}

	// --- Tags ---

	const handleTagChange = (categoryName: string, selectedTag: string) => {
		if (!selectedTag) return

		const existingIndex = filterState.tags.findIndex(
			(t) => t.category === categoryName
		)
		let updatedTags: TagFilter[]

		if (existingIndex >= 0) {
			const existing = filterState.tags[existingIndex]
			const hasTag = existing.values.includes(selectedTag)
			if (hasTag) {
				const newValues = existing.values.filter((v) => v !== selectedTag)
				if (newValues.length === 0) {
					updatedTags = filterState.tags.filter(
						(t) => t.category !== categoryName
					)
				} else {
					updatedTags = [
						...filterState.tags.slice(0, existingIndex),
						{ ...existing, values: newValues },
						...filterState.tags.slice(existingIndex + 1),
					]
				}
			} else {
				updatedTags = [
					...filterState.tags.slice(0, existingIndex),
					{
						...existing,
						values: [...existing.values, selectedTag],
					},
					...filterState.tags.slice(existingIndex + 1),
				]
			}
		} else {
			updatedTags = [
				...filterState.tags,
				{
					category: categoryName,
					values: [selectedTag],
					mode: 'include',
				},
			]
		}

		filterState = { ...filterState, tags: updatedTags }
		onfilterchange?.(filterState)
	}

	const toggleTagMode = (categoryName: string) => {
		const existingIndex = filterState.tags.findIndex(
			(t) => t.category === categoryName
		)
		if (existingIndex < 0) return

		const existing = filterState.tags[existingIndex]
		const newMode: FilterTagMode =
			existing.mode === 'include' ? 'exclude' : 'include'
		const updatedTags = [
			...filterState.tags.slice(0, existingIndex),
			{ ...existing, mode: newMode },
			...filterState.tags.slice(existingIndex + 1),
		]

		filterState = { ...filterState, tags: updatedTags }
		onfilterchange?.(filterState)
	}

	const getTagFilter = (categoryName: string): TagFilter | undefined => {
		return filterState.tags.find((t) => t.category === categoryName)
	}

	const getSelectedTags = (categoryName: string): string[] => {
		return getTagFilter(categoryName)?.values ?? []
	}

	const getTagQuery = (categoryName: string): string => {
		return tagQueries[categoryName] ?? ''
	}

	const setTagQuery = (categoryName: string, value: string) => {
		tagQueries = { ...tagQueries, [categoryName]: value }
	}

	const getTagOptions = (
		tagCategory: TagCategory,
		selectedTags: string[]
	): string[] => {
		const query = getTagQuery(tagCategory.category).trim().toLowerCase()
		const options = query
			? tagCategory.tags.filter((tag) => tag.toLowerCase().includes(query))
			: tagCategory.tags
		return options
	}

	const getTagMode = (categoryName: string): FilterTagMode => {
		return getTagFilter(categoryName)?.mode ?? 'include'
	}

	const clearFilters = () => {
		filterState = {
			dateRange: { start: undefined, end: undefined },
			transactionTypes: [],
			categories: [],
			tags: [],
		}
		onfilterchange?.(filterState)
		openPanel = null
	}

	// Toggle panel open/closed
	const togglePanel = (panel: string) => {
		openPanel = openPanel === panel ? null : panel
	}

	const closePanel = () => {
		openPanel = null
	}

	// Chip class composition
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
	const tagOptionBase = [
		'd-badge',
		'cursor-pointer',
		'd-badge-md',
		'text-sm',
		'text-center',
		'leading-snug',
		'h-auto',
		'min-h-6',
		'whitespace-normal',
		'break-words',
		'py-1',
		'transition-all',
		'w-full',
		'justify-center',
	]
	const tagOptionInactiveClass =
		'd-badge-outline text-base-content/70 hover:d-badge-primary'
	const tagOptionIncludeClass = 'border-info/30 bg-info/10 text-info'
	const tagOptionExcludeClass =
		'border-error/30 bg-error/10 text-error line-through opacity-80'
</script>

{#snippet categoryPanel()}
	<div class="flex flex-col gap-2">
		<label class="d-input-bordered d-input d-input-sm flex items-center gap-2">
			<input
				type="text"
				class="grow"
				placeholder="Search categories..."
				bind:value={categoryQuery}
			/>
			<SearchIcon class="size-3 opacity-50" />
		</label>
		{#if categorySubGroups.length > 0}
			<div class="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
				{#each categorySubGroups as group (group.name)}
					{@const groupNames = group.options.map((option) => option.fullName)}
					{@const allSelected =
						groupNames.length > 0 &&
						groupNames.every((name) => filterState.categories.includes(name))}
					{@const anySelected = groupNames.some((name) =>
						filterState.categories.includes(name)
					)}
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between gap-2">
							<span
								class="text-[11px] font-semibold tracking-wider text-base-content/60 uppercase"
							>
								{group.name}
							</span>
							<div class="flex items-center gap-2">
								<button
									type="button"
									class={mergeClass(
										[
											'text-[10px]',
											'font-semibold',
											'tracking-wider',
											'uppercase',
											'rounded-full',
											'border',
											'px-2',
											'py-0.5',
											'transition-colors',
										],
										allSelected
											? 'border-primary/40 text-primary'
											: 'border-base-300 text-base-content/50 hover:text-base-content'
									)}
									onclick={() => toggleCategoryGroup(group)}
								>
									All
								</button>
								<button
									type="button"
									class={mergeClass(
										[
											'text-[10px]',
											'font-semibold',
											'tracking-wider',
											'uppercase',
											'rounded-full',
											'border',
											'px-2',
											'py-0.5',
											'transition-colors',
										],
										anySelected
											? 'border-base-300 text-base-content/70 hover:text-base-content'
											: 'border-base-300 text-base-content/30'
									)}
									onclick={() => clearCategoryGroup(group)}
									disabled={!anySelected}
								>
									Clear
								</button>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
							{#each group.options as option (option.fullName)}
								<button
									type="button"
									class={mergeClass(
										tagOptionBase,
										filterState.categories.includes(option.fullName)
											? tagOptionIncludeClass
											: tagOptionInactiveClass
									)}
									onclick={() => toggleCategory(option.fullName)}
								>
									{option.subcategory || option.displayName}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-xs text-base-content/50">No categories found</p>
		{/if}
	</div>
{/snippet}

<div class={mergeClass(['w-full'], className)} {...rest}>
	<!-- Horizontal Filter Chips Row -->
	<div
		class="flex items-center gap-2 overflow-x-auto rounded-lg bg-base-200/40 px-3 py-2"
	>
		<!-- Date Filter Chip -->
		<button
			type="button"
			class={mergeClass(
				chipBase,
				hasDateFilter ? chipActiveClass : chipInactiveClass
			)}
			aria-expanded={openPanel === 'date'}
			onclick={() => togglePanel('date')}
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

		<!-- Transaction Types Filter Chip -->
		<button
			type="button"
			class={mergeClass(
				chipBase,
				hasTypeFilter ? chipActiveClass : chipInactiveClass
			)}
			aria-expanded={openPanel === 'types'}
			onclick={() => togglePanel('types')}
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

		<!-- Category Filter Chip -->
		<button
			type="button"
			class={mergeClass(
				chipBase,
				hasCategoryFilter ? chipActiveClass : chipInactiveClass
			)}
			aria-expanded={openPanel === 'category'}
			onclick={() => togglePanel('category')}
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

		<!-- Dynamic Tag Category Chips -->
		{#each availableTagCategories as tagCategory (tagCategory.category)}
			{@const activeCount = getCategoryActiveCount(tagCategory.category)}
			<button
				type="button"
				class={mergeClass(
					chipBase,
					activeCount > 0 ? chipActiveClass : chipInactiveClass
				)}
				aria-expanded={openPanel === tagCategory.category}
				onclick={() => togglePanel(tagCategory.category)}
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

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- Clear Filters Button -->
		{#if isActive}
			<Button
				variant="ghost"
				class="h-7 min-h-0 gap-1 text-base-content/60 d-btn-xs hover:text-base-content"
				onclick={clearFilters}
			>
				<X class="size-3" />
				<span class="text-xs">Clear</span>
			</Button>
		{/if}
	</div>

	<!-- Full-Width Dropdown Panels -->
	{#if openPanel !== null}
		<div
			class="mt-1 rounded-lg border border-base-300/60 bg-base-100 p-4 shadow-lg"
		>
			<!-- Date Range Panel -->
			{#if openPanel === 'date'}
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Date Range
						</span>
						{#if hasDateFilter}
							<button
								type="button"
								class="text-xs text-base-content/60 transition-colors hover:text-base-content"
								onclick={() => {
									filterState = {
										...filterState,
										dateRange: { start: undefined, end: undefined },
									}
									onfilterchange?.(filterState)
								}}
							>
								Clear
							</button>
						{/if}
					</div>

					<div class="flex flex-col gap-3">
						<div class="flex flex-wrap items-center gap-2">
							<input
								id="start-date"
								type="date"
								class="d-input-bordered d-input d-input-sm opacity-80 transition-opacity hover:opacity-100 focus:opacity-100"
								value={formatDate(filterState.dateRange.start)}
								onchange={handleStartDateChange}
							/>
							<span class="text-xs text-base-content/50">to</span>
							<input
								id="end-date"
								type="date"
								class="d-input-bordered d-input d-input-sm opacity-80 transition-opacity hover:opacity-100 focus:opacity-100"
								value={formatDate(filterState.dateRange.end)}
								onchange={handleEndDateChange}
							/>
						</div>

						<div class="flex flex-wrap gap-1.5">
							{#each getDatePresets() as preset (preset.label)}
								<button
									type="button"
									class={mergeClass(
										[
											'd-badge',
											'd-badge-md',
											'cursor-pointer',
											'transition-all',
										],
										isPresetActive(preset)
											? 'd-badge-primary'
											: 'hover:d-badge-primary/50 d-badge-ghost'
									)}
									onclick={() => applyDatePreset(preset)}
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<!-- Category Panel -->
			{#if openPanel === 'category'}
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Category
						</span>
						{#if hasCategoryFilter}
							<button
								type="button"
								class="text-xs text-base-content/60 transition-colors hover:text-base-content"
								onclick={clearCategoryFilter}
							>
								Clear
							</button>
						{/if}
					</div>
					{@render categoryPanel()}
				</div>
			{/if}

			<!-- Transaction Types Panel -->
			{#if openPanel === 'types'}
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span
							class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
						>
							Transaction Type
						</span>
						{#if hasTypeFilter}
							<button
								type="button"
								class="text-xs text-base-content/60 transition-colors hover:text-base-content"
								onclick={() => {
									filterState = { ...filterState, transactionTypes: [] }
									onfilterchange?.(filterState)
								}}
							>
								Clear
							</button>
						{/if}
					</div>
					<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
						{#each transactionTypes as type (type)}
							<button
								type="button"
								class={mergeClass(
									tagOptionBase,
									filterState.transactionTypes.includes(type)
										? tagOptionIncludeClass
										: tagOptionInactiveClass
								)}
								onclick={() => toggleTransactionType(type)}
							>
								{type}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Tag Category Panels -->
			{#each availableTagCategories as tagCategory (tagCategory.category)}
				{#if openPanel === tagCategory.category}
					{@const selectedTags = getSelectedTags(tagCategory.category)}
					{@const tagMode = getTagMode(tagCategory.category)}
					{@const tagOptions = getTagOptions(tagCategory, selectedTags)}

					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between">
							<span
								class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
							>
								{tagCategory.category}
							</span>
							<div class="flex items-center gap-3">
								{#if selectedTags.length > 0}
									<div class="flex items-center gap-2">
										<span
											class={mergeClass(
												[
													'text-[10px]',
													'font-bold',
													'tracking-wide',
													'uppercase',
												],
												tagMode === 'include' ? 'text-success' : 'text-error'
											)}
										>
											{tagMode}
										</span>
										<input
											type="checkbox"
											class="d-toggle d-toggle-xs"
											class:d-toggle-success={tagMode === 'include'}
											class:d-toggle-error={tagMode === 'exclude'}
											class:text-success={tagMode === 'include'}
											class:text-error={tagMode === 'exclude'}
											checked={tagMode === 'include'}
											onclick={() => toggleTagMode(tagCategory.category)}
										/>
									</div>
									<button
										type="button"
										class="text-xs text-base-content/60 transition-colors hover:text-base-content"
										onclick={() => {
											filterState = {
												...filterState,
												tags: filterState.tags.filter(
													(t) => t.category !== tagCategory.category
												),
											}
											onfilterchange?.(filterState)
										}}
									>
										Clear
									</button>
								{/if}
							</div>
						</div>

						<div class="flex flex-col gap-2">
							<label
								class="d-input-bordered d-input d-input-sm flex items-center gap-2"
							>
								<input
									type="text"
									class="grow"
									placeholder={`Search ${tagCategory.category.toLowerCase()} tags...`}
									value={getTagQuery(tagCategory.category)}
									oninput={(event) => {
										const input = event.target as HTMLInputElement
										setTagQuery(tagCategory.category, input.value)
									}}
									onkeydown={(event) => {
										if (event.key !== 'Enter') return
										event.preventDefault()
										const nextOption = tagOptions.find(
											(option) => !selectedTags.includes(option)
										)
										if (!nextOption) return
										handleTagChange(tagCategory.category, nextOption)
										setTagQuery(tagCategory.category, '')
									}}
								/>
								<SearchIcon class="size-3 opacity-50" />
							</label>

							{#if tagOptions.length > 0}
								<div
									class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6"
								>
									{#each tagOptions as option (option)}
										{@const isSelected = selectedTags.includes(option)}
										<button
											type="button"
											class={mergeClass(
												tagOptionBase,
												isSelected
													? tagMode === 'include'
														? tagOptionIncludeClass
														: tagOptionExcludeClass
													: tagOptionInactiveClass
											)}
											onclick={() => {
												handleTagChange(tagCategory.category, option)
												setTagQuery(tagCategory.category, '')
											}}
										>
											{option}
										</button>
									{/each}
								</div>
							{:else}
								<p class="text-xs text-base-content/50">
									No tags match your search
								</p>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
