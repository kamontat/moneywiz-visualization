<script lang="ts">
	import type {
		FilterState,
		TagFilter,
		FilterTagMode,
	} from '$lib/analytics/filters/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import CalendarIcon from '@iconify-svelte/lucide/calendar'
	import ChevronDown from '@iconify-svelte/lucide/chevron-down'
	import X from '@iconify-svelte/lucide/x'

	import Button from '$components/atoms/Button.svelte'
	import Select from '$components/atoms/Select.svelte'
	import { hasActiveFilters } from '$lib/analytics/filters/models'
	import { mergeClass } from '$lib/components'

	type TagCategory = {
		category: string
		tags: string[]
	}

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableTagCategories: TagCategory[]
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
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

	const isActive = $derived(hasActiveFilters(filterState))

	// --- Chip active state helpers ---

	const hasDateFilter = $derived(
		!!(filterState.dateRange.start || filterState.dateRange.end)
	)
	const hasTypeFilter = $derived(filterState.transactionTypes.length > 0)
	const getCategoryActiveCount = (categoryName: string): number => {
		return getSelectedTags(categoryName).length
	}

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

	const getTagMode = (categoryName: string): FilterTagMode => {
		return getTagFilter(categoryName)?.mode ?? 'include'
	}

	const clearFilters = () => {
		filterState = {
			dateRange: { start: undefined, end: undefined },
			transactionTypes: [],
			tags: [],
		}
		onfilterchange?.(filterState)
		openPanel = null
	}

	// Toggle panel open/closed
	const togglePanel = (panel: string) => {
		openPanel = openPanel === panel ? null : panel
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
</script>

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
				class="h-7 min-h-0 gap-1 text-base-content/50 d-btn-xs hover:text-base-content"
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
			class="mt-1 rounded-lg border border-base-300/40 bg-base-100 p-4 shadow-lg"
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
								class="text-xs text-base-content/50 transition-colors hover:text-base-content"
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
							<span class="text-xs text-base-content/40">to</span>
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
								class="text-xs text-base-content/50 transition-colors hover:text-base-content"
								onclick={() => {
									filterState = { ...filterState, transactionTypes: [] }
									onfilterchange?.(filterState)
								}}
							>
								Clear
							</button>
						{/if}
					</div>
					<div class="flex flex-wrap gap-2">
						{#each transactionTypes as type (type)}
							<button
								type="button"
								class={mergeClass(
									[
										'd-badge',
										'd-badge-lg',
										'px-4',
										'py-2',
										'cursor-pointer',
										'transition-all',
									],
									filterState.transactionTypes.includes(type)
										? 'd-badge-primary'
										: 'hover:d-badge-primary/50 d-badge-outline text-base-content/70'
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
											checked={tagMode === 'include'}
											onclick={() => toggleTagMode(tagCategory.category)}
										/>
									</div>
									<button
										type="button"
										class="text-xs text-base-content/50 transition-colors hover:text-base-content"
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

						<Select
							values={[
								'',
								...tagCategory.tags.filter((t) => !selectedTags.includes(t)),
							]}
							value=""
							class="w-full max-w-md d-select-sm"
							placeholder={`Add ${tagCategory.category.toLowerCase()}...`}
							onchange={(e) => {
								const select = e.target as HTMLSelectElement
								handleTagChange(tagCategory.category, select.value)
								select.value = ''
							}}
						/>

						{#if selectedTags.length > 0}
							<div class="flex flex-wrap gap-1.5">
								{#each selectedTags as tag (tag)}
									<span
										class={mergeClass(
											['d-badge', 'gap-1', 'pr-1', 'pl-2', 'd-badge-sm'],
											tagMode === 'include'
												? 'd-badge-info/10 border-info/20 text-info-content'
												: 'd-badge-error/10 border-error/20 text-error-content line-through opacity-80'
										)}
									>
										{tag}
										<button
											type="button"
											class="ml-1 rounded-full p-0.5 hover:bg-black/10 hover:text-current"
											onclick={() => handleTagChange(tagCategory.category, tag)}
										>
											<X class="size-3" />
										</button>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
