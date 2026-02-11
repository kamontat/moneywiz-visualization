<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			openPanel: string | null
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		openPanel = null,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	const hasDateFilter = $derived(
		!!(filterState.dateRange.start || filterState.dateRange.end)
	)

	type DatePreset = { label: string; start: Date; end: Date }

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

	const getDatePresets = (): DatePreset[] => {
		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth()
		const day = now.getDate()
		const endOfToday = new Date(year, month, day, 23, 59, 59, 999)
		const startOfLast365Days = new Date(year, month, day - 364, 0, 0, 0, 0)

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
				label: 'Last 365 Days',
				start: startOfLast365Days,
				end: endOfToday,
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

	const clearDateRange = () => {
		filterState = {
			...filterState,
			dateRange: { start: undefined, end: undefined },
		}
		onfilterchange?.(filterState)
	}
</script>

<CollapsiblePanel open={openPanel === 'date'} class={className} {...rest}>
	<FilterPanelHeader
		title="Date Range"
		showClear={hasDateFilter}
		onclear={clearDateRange}
	/>

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
						['d-badge', 'd-badge-md', 'cursor-pointer', 'transition-all'],
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
</CollapsiblePanel>
