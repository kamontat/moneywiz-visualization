<script lang="ts">
	import type { FilterOptions } from '$lib/analytics/filters/models/options'
	import type { FilterState } from '$lib/analytics/filters/models/state'
	import type { CsvState } from '$lib/csv/models'
	import type {
		ParsedCategory,
		ParsedTransaction,
	} from '$lib/transactions/models'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'

	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import Dashboard from '$components/organisms/Dashboard.svelte'
	import FilterBar from '$components/organisms/FilterBar.svelte'
	import QuickSummary from '$components/organisms/QuickSummary.svelte'
	import {
		filter,
		byDateRange,
		byCategory,
		byTransactionType,
		byTags,
	} from '$lib/analytics/filters'
	import { filterOptionsStore } from '$lib/analytics/filters/init'
	import { emptyFilterState } from '$lib/analytics/filters/models/state'
	import { bySummarize, transform } from '$lib/analytics/transforms'
	import { csvStore, csvUploading } from '$lib/csv'
	import { analytic } from '$lib/loggers'
	import {
		extractCategories,
		extractTagCategories,
		getTransactionCount,
		getTransactions,
	} from '$lib/transactions'

	const DEFAULT_LIMIT = 20
	const DATE_FILTER_STORAGE_KEY = 'moneywiz:filters:date-range:v1'
	const log = analytic.extends('routes.page')

	type PersistedDateRange = {
		start?: number
		end?: number
	}

	let allTransactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)
	let availableCategories = $state(extractCategories([]))
	let tagCategories = $state(extractTagCategories([]))
	let cachedFilterOptions = $state<FilterOptions | undefined>(undefined)
	let fileInfo = $state<CsvState | undefined>(undefined)
	let uploading = $state(false)
	let filterState = $state<FilterState>(emptyFilterState())
	let limit = $state(DEFAULT_LIMIT)
	let didHydrateDateFilter = $state(false)

	const loadPersistedDateRange = () => {
		if (typeof window === 'undefined') return undefined
		try {
			const raw = window.localStorage.getItem(DATE_FILTER_STORAGE_KEY)
			if (!raw) return undefined
			const parsed = JSON.parse(raw) as PersistedDateRange
			return {
				start:
					typeof parsed.start === 'number' ? new Date(parsed.start) : undefined,
				end: typeof parsed.end === 'number' ? new Date(parsed.end) : undefined,
			}
		} catch (error) {
			log.warn('failed to load persisted date range', { error })
			return undefined
		}
	}

	const persistDateRange = (dateRange: FilterState['dateRange']) => {
		if (typeof window === 'undefined') return
		try {
			if (!dateRange.start && !dateRange.end) {
				window.localStorage.removeItem(DATE_FILTER_STORAGE_KEY)
				return
			}

			const value: PersistedDateRange = {
				start: dateRange.start?.getTime(),
				end: dateRange.end?.getTime(),
			}
			window.localStorage.setItem(
				DATE_FILTER_STORAGE_KEY,
				JSON.stringify(value)
			)
		} catch (error) {
			log.warn('failed to persist date range', { error })
		}
	}

	const loadData = async () => {
		totalCount = await getTransactionCount()
		allTransactions = await getTransactions()
		const cached = cachedFilterOptions
		const fileMatches =
			cached?.fileName !== undefined &&
			fileInfo?.fileName !== undefined &&
			cached.fileName === fileInfo.fileName &&
			cached.modifiedAt === fileInfo.modifiedAt
		if (cached && (fileMatches || !fileInfo)) {
			availableCategories = cached.categories
			tagCategories = cached.tags
			return
		}

		const categoryTransactions = allTransactions.filter(
			(trx) => 'category' in trx
		)
		availableCategories = extractCategories(
			categoryTransactions as { category?: ParsedCategory }[]
		)
		tagCategories = extractTagCategories(allTransactions)
		if (fileInfo?.fileName && fileInfo?.modifiedAt) {
			await filterOptionsStore.setAsync({
				categories: availableCategories,
				tags: tagCategories,
				fileName: fileInfo.fileName,
				modifiedAt: fileInfo.modifiedAt,
			})
		}
	}

	onMount(() => {
		const persistedDateRange = loadPersistedDateRange()
		if (persistedDateRange) {
			filterState = {
				...filterState,
				dateRange: persistedDateRange,
			}
		}
		didHydrateDateFilter = true

		cachedFilterOptions = get(filterOptionsStore)
		filterOptionsStore.subscribe((options: FilterOptions | undefined) => {
			cachedFilterOptions = options
		})
		loadData()
		csvStore.subscribe((state) => {
			fileInfo = state
			loadData()
		})
		csvUploading.subscribe((u: boolean) => {
			uploading = u
		})
	})

	$effect(() => {
		if (!didHydrateDateFilter) return
		persistDateRange(filterState.dateRange)
	})

	const filteredTransactions = $derived.by(() => {
		let result = allTransactions
		const filters = []

		if (filterState.dateRange.start && filterState.dateRange.end) {
			filters.push(
				byDateRange(filterState.dateRange.start, filterState.dateRange.end)
			)
		} else if (filterState.dateRange.start) {
			filters.push(byDateRange(filterState.dateRange.start, new Date()))
		} else if (filterState.dateRange.end) {
			filters.push(byDateRange(new Date(0), filterState.dateRange.end))
		}

		if (filterState.transactionTypes.length > 0) {
			filters.push(
				byTransactionType({
					types: filterState.transactionTypes,
					mode: 'include',
				})
			)
		}

		if (filterState.categories.length > 0) {
			filters.push(
				byCategory({
					categories: filterState.categories,
					mode: filterState.categoryMode,
				})
			)
		}

		if (filterState.tags.length > 0) {
			filters.push(
				byTags(
					...filterState.tags.map((t) => ({
						category: t.category,
						values: t.values,
						mode: t.mode,
					}))
				)
			)
		}

		if (filters.length > 0) {
			result = filter(result, ...filters)
		}

		return result
	})

	const filteredSummary = $derived.by(() => {
		if (filteredTransactions.length > 0) {
			return transform(filteredTransactions, bySummarize())
		}
		return undefined
	})

	const displayTransactions = $derived(
		filteredTransactions
			.toSorted((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, limit)
	)
	const filteredCount = $derived(filteredTransactions.length)
</script>

<AppBody>
	<BodyHeader
		fileName={fileInfo?.fileName}
		startDate={filteredSummary?.dateRange.start}
		endDate={filteredSummary?.dateRange.end}
		totalRows={totalCount}
		filteredRows={filteredCount}
	/>

	{#if totalCount > 0}
		<FilterBar
			bind:filterState
			{availableCategories}
			availableTagCategories={tagCategories}
			class="mt-4"
		/>
	{/if}

	{#if filteredSummary}
		<QuickSummary summary={filteredSummary} class="mt-6" />
	{/if}

	<Dashboard
		transactions={displayTransactions}
		allTransactions={filteredTransactions}
		totalCount={filteredCount}
		{uploading}
		{limit}
		onlimitchange={(newLimit) => (limit = newLimit)}
		hasData={totalCount > 0}
		class="mt-6 mb-8"
	/>
</AppBody>
