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
		['rounded-box', 'bg-base-200/50', 'flex', 'flex-col'],
		className
	)}
	{...rest}
>
	<!-- Collapsible header -->
	<button
		type="button"
		class="flex w-full items-center justify-between rounded-box
			p-3 transition-colors hover:bg-base-300/30"
		onclick={() => (collapsed = !collapsed)}
	>
		<div class="flex items-center gap-2">
			<span
				class="inline-block text-sm text-base-content/70
					transition-transform {collapsed ? '' : 'rotate-90'}"
			>
				&#9654;
			</span>
			<span class="text-sm font-semibold text-base-content"> Filters </span>
			{#if isActive && collapsed}
				<span class="d-badge d-badge-xs d-badge-primary">
					{activeFilterCount}
				</span>
			{/if}
		</div>
		{#if isActive}
			<Button
				variant="ghost"
				class="d-btn-xs"
				onclick={(e) => {
					e.stopPropagation()
					clearFilters()
				}}
			>
				Clear
			</Button>
		{/if}
	</button>

	<!-- Collapsible content -->
	{#if !collapsed}
		<div class="flex flex-col gap-4 px-4 pb-4">
			<!-- Date Range Section -->
			<div class="flex flex-col gap-2">
				<span class="text-xs font-medium text-base-content/70">
					Date Range
				</span>

				<!-- Quick date presets -->
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

				<!-- Custom date inputs -->
				<div class="flex flex-wrap items-center gap-2">
					<input
						id="start-date"
						type="date"
						class="d-input-bordered d-input d-input-sm"
						value={formatDate(filterState.dateRange.start)}
						onchange={handleStartDateChange}
					/>
					<span class="text-xs text-base-content/50">to</span>
					<input
						id="end-date"
						type="date"
						class="d-input-bordered d-input d-input-sm"
						value={formatDate(filterState.dateRange.end)}
						onchange={handleEndDateChange}
					/>
				</div>
			</div>

			<!-- Transaction Type Section -->
			<div class="flex flex-col gap-1">
				<span class="text-xs font-medium text-base-content/70"> Type </span>
				<div class="flex flex-wrap gap-1">
					{#each transactionTypes as type (type)}
						<button
							type="button"
							class={mergeClass(
								['d-badge', 'd-badge-sm', 'cursor-pointer', 'transition-all'],
								filterState.transactionTypes.includes(type)
									? 'd-badge-primary'
									: 'hover:d-badge-primary/50 d-badge-ghost'
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
				<div class="flex flex-col gap-3">
					<span class="text-xs font-medium text-base-content/70"> Tags </span>
					{#each availableTagCategories as tagCategory (tagCategory.category)}
						{@const selectedTags = getSelectedTags(tagCategory.category)}
						{@const tagMode = getTagMode(tagCategory.category)}
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<span class="text-xs text-base-content/60">
									{tagCategory.category}
								</span>
								{#if selectedTags.length > 0}
									<button
										type="button"
										class={mergeClass(
											[
												'd-badge',
												'd-badge-xs',
												'cursor-pointer',
												'transition-all',
												'font-mono',
											],
											tagMode === 'include'
												? 'd-badge-success'
												: 'd-badge-error'
										)}
										title={tagMode === 'include'
											? 'Including selected tags (click to exclude)'
											: 'Excluding selected tags (click to include)'}
										onclick={() => toggleTagMode(tagCategory.category)}
									>
										{tagMode === 'include' ? 'include' : 'exclude'}
									</button>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<Select
									values={[
										'',
										...tagCategory.tags.filter(
											(t) => !selectedTags.includes(t)
										),
									]}
									value=""
									class="min-w-32 d-select-sm"
									onchange={(e) => {
										const select = e.target as HTMLSelectElement
										handleTagChange(tagCategory.category, select.value)
										select.value = ''
									}}
								/>
								{#if selectedTags.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each selectedTags as tag (tag)}
											<span
												class={mergeClass(
													['d-badge', 'gap-1', 'd-badge-sm'],
													tagMode === 'include'
														? 'd-badge-info'
														: 'd-badge-outline d-badge-error'
												)}
											>
												{tagMode === 'exclude' ? '!' : ''}{tag}
												<button
													type="button"
													class="hover:text-error"
													onclick={() =>
														handleTagChange(tagCategory.category, tag)}
												>
													&times;
												</button>
											</span>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
