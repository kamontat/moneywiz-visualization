<script lang="ts">
	import type {
		FilterState,
		TagFilter,
		FilterTagMode,
	} from '$lib/analytics/filters/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import Button from '$components/atoms/Button.svelte'
	import Select from '$components/atoms/Select.svelte'
	import { mergeClass } from '$lib/components'
	import { hasActiveFilters } from '$lib/analytics/filters/models'
	import ChevronRight from '@iconify-svelte/lucide/chevron-right'
	import X from '@iconify-svelte/lucide/x'

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

	let collapsed = $state(false)

	const isActive = $derived(hasActiveFilters(filterState))

	const activeFilterCount = $derived.by(() => {
		let count = 0
		if (filterState.dateRange.start || filterState.dateRange.end) count++
		if (filterState.transactionTypes.length > 0) count++
		if (filterState.tags.some((t) => t.values.length > 0)) count++
		return count
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
		filterState = {
			...filterState,
			dateRange: {
				start: preset.start,
				end: preset.end,
			},
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
	}
</script>

<div
	class={mergeClass(
		[
			'rounded-box',
			'bg-base-200/30',
			'border',
			'border-base-300/40',
			'flex',
			'flex-col',
			'overflow-hidden',
		],
		className
	)}
	{...rest}
>
	<!-- Collapsible Header -->
	<div
		class="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-base-300/30"
		onclick={() => (collapsed = !collapsed)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && (collapsed = !collapsed)}
	>
		<div class="flex items-center gap-3 overflow-hidden">
			<div class="flex items-center gap-2">
				<ChevronRight
					class={mergeClass(
						[
							'size-4',
							'text-base-content/50',
							'transition-transform',
							'duration-200',
						],
						!collapsed ? 'rotate-90' : undefined
					)}
				/>
				<span
					class="text-xs font-bold tracking-wider text-base-content/80 uppercase"
				>
					Filters
				</span>
			</div>

			{#if collapsed && isActive}
				<div class="flex flex-nowrap items-center gap-2 overflow-hidden">
					<div class="h-4 w-px bg-base-content/20"></div>

					{#each getDatePresets() as preset}
						{#if isPresetActive(preset)}
							<span
								class="d-badge d-badge-outline d-badge-xs whitespace-nowrap d-badge-neutral"
							>
								{preset.label}
							</span>
						{/if}
					{/each}
					{#if !getDatePresets().some(isPresetActive) && (filterState.dateRange.start || filterState.dateRange.end)}
						<span
							class="d-badge d-badge-outline d-badge-xs whitespace-nowrap d-badge-neutral"
						>
							Custom Dates
						</span>
					{/if}

					{#if filterState.transactionTypes.length > 0}
						<span
							class="d-badge d-badge-outline d-badge-xs whitespace-nowrap d-badge-neutral"
						>
							{filterState.transactionTypes.length} Types
						</span>
					{/if}

					{#each filterState.tags as tag}
						{#if tag.values.length > 0}
							<span
								class="d-badge d-badge-outline d-badge-xs whitespace-nowrap d-badge-neutral"
							>
								{tag.category}: {tag.values.length}
							</span>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		{#if isActive}
			<Button
				variant="ghost"
				class="text-base-content/60 d-btn-xs hover:text-base-content"
				onclick={(e) => {
					e.stopPropagation()
					clearFilters()
				}}
			>
				<X class="size-3.5" />
				Clear
			</Button>
		{/if}
	</div>

	<!-- Collapsible Content -->
	{#if !collapsed}
		<div class="flex flex-col">
			<!-- Date Range Section -->
			<div class="flex flex-col gap-3 border-b border-base-300/50 px-4 py-3">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/50 uppercase"
				>
					Date Range
				</span>

				<div class="flex flex-wrap items-center gap-3">
					<!-- Presets -->
					<div class="flex flex-wrap gap-1">
						{#each getDatePresets() as preset (preset.label)}
							<button
								type="button"
								class={mergeClass(
									['d-badge', 'd-badge-sm', 'cursor-pointer', 'transition-all'],
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

					<!-- Separator -->
					<span class="text-base-content/20">|</span>

					<!-- Inputs -->
					<div class="flex flex-wrap items-center gap-2">
						<input
							id="start-date"
							type="date"
							class="d-input-bordered d-input d-input-xs opacity-80 transition-opacity hover:opacity-100 focus:opacity-100"
							value={formatDate(filterState.dateRange.start)}
							onchange={handleStartDateChange}
						/>
						<span class="text-xs text-base-content/40">to</span>
						<input
							id="end-date"
							type="date"
							class="d-input-bordered d-input d-input-xs opacity-80 transition-opacity hover:opacity-100 focus:opacity-100"
							value={formatDate(filterState.dateRange.end)}
							onchange={handleEndDateChange}
						/>
					</div>
				</div>
			</div>

			<!-- Transaction Type Section -->
			<div class="flex flex-col gap-3 border-b border-base-300/50 px-4 py-3">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/50 uppercase"
				>
					Transaction Type
				</span>
				<div class="flex flex-wrap gap-2">
					{#each transactionTypes as type (type)}
						<button
							type="button"
							class={mergeClass(
								[
									'd-badge',
									'd-badge-md',
									'px-3',
									'py-1',
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

			<!-- Tags Section -->
			{#if availableTagCategories.length > 0}
				<div class="flex flex-col gap-3 px-4 py-3 pb-4">
					<span
						class="text-xs font-semibold tracking-wider text-base-content/50 uppercase"
					>
						Tags
					</span>
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each availableTagCategories as tagCategory (tagCategory.category)}
							{@const selectedTags = getSelectedTags(tagCategory.category)}
							{@const tagMode = getTagMode(tagCategory.category)}

							<div
								class="flex flex-col gap-3 rounded-lg bg-base-100/80 p-3 ring-1 ring-base-300/30"
							>
								<div class="flex items-center justify-between">
									<span class="text-xs font-medium text-base-content/70">
										{tagCategory.category}
									</span>
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
									{/if}
								</div>

								<Select
									values={[
										'',
										...tagCategory.tags.filter(
											(t) => !selectedTags.includes(t)
										),
									]}
									value=""
									class="w-full d-select-sm"
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
													onclick={() =>
														handleTagChange(tagCategory.category, tag)}
												>
													<X class="size-3" />
												</button>
											</span>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
