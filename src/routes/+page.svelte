<script lang="ts">
	import type { FilterState as BaseFilterState } from '$lib/analytics/filters/models/state'
	import type { CsvState } from '$lib/csv/models'
	import type {
		ParsedCategory,
		ParsedTransaction,
	} from '$lib/transactions/models'
	import { onMount } from 'svelte'

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
	import { emptyFilterState } from '$lib/analytics/filters/models/state'
	import { bySummarize, transform } from '$lib/analytics/transforms'
	import { csvStore, csvUploading } from '$lib/csv'
	import {
		extractCategories,
		extractTagCategories,
		getTransactionCount,
		getTransactions,
	} from '$lib/transactions'

	type FilterState = BaseFilterState & { categories: string[] }

	const DEFAULT_LIMIT = 20

	let allTransactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)
	let availableCategories = $state(extractCategories([]))
	let tagCategories = $state(extractTagCategories([]))
	let fileInfo = $state<CsvState | undefined>(undefined)
	let uploading = $state(false)
	let filterState = $state<FilterState>({
		...emptyFilterState(),
		categories: [],
	})
	let limit = $state(DEFAULT_LIMIT)

	const loadData = async () => {
		totalCount = await getTransactionCount()
		allTransactions = await getTransactions()
		availableCategories = extractCategories(allTransactions)
		tagCategories = extractTagCategories(allTransactions)
	}

	onMount(() => {
		loadData()
		csvStore.subscribe((state) => {
			fileInfo = state
			loadData()
		})
		csvUploading.subscribe((u: boolean) => {
			uploading = u
		})
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
					mode: 'include',
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
