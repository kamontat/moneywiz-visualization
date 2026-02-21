<script lang="ts">
	import type { FilterOptions } from '$lib/analytics/filters/models/options'
	import type { FilterState } from '$lib/analytics/filters/models/state'
	import type { DatabaseState } from '$lib/database/models'
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
		byAccount,
		byDateRange,
		byCategory,
		byPayee,
		byTransactionType,
		byTags,
	} from '$lib/analytics/filters'
	import {
		loadPersistedDateRange,
		persistDateRange,
	} from '$lib/analytics/filters/dateRangePersistence'
	import {
		loadPersistedFilterSelection,
		persistFilterSelection,
	} from '$lib/analytics/filters/filterSelectionPersistence'
	import { filterOptionsStore } from '$lib/analytics/filters/init'
	import { emptyFilterState } from '$lib/analytics/filters/models/state'
	import {
		bySummarize,
		deriveBaselineRange,
		deriveCurrentRange,
		sliceByDateRange,
		transform,
	} from '$lib/analytics/transforms'
	import { databaseStore, databaseUploading } from '$lib/database'
	import {
		extractCategories,
		extractPayees,
		extractTagCategories,
		extractAccounts,
		getTransactionCount,
		getTransactions,
	} from '$lib/transactions'

	const DEFAULT_LIMIT = 20

	let allTransactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)
	let availableCategories = $state(extractCategories([]))
	let availablePayees = $state<string[]>([])
	let availableAccounts = $state<string[]>([])
	let tagCategories = $state(extractTagCategories([]))
	let cachedFilterOptions = $state<FilterOptions | undefined>(undefined)
	let fileInfo = $state<DatabaseState | undefined>(undefined)
	let uploading = $state(false)
	let filterState = $state<FilterState>(emptyFilterState())
	let limit = $state(DEFAULT_LIMIT)
	let didHydrateDateFilter = $state(false)

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
			// Load payees and accounts from cache if available, otherwise extract from transactions
			availablePayees =
				cached.payees ?? extractPayees(allTransactions as { payee?: string }[])
			availableAccounts = cached.accounts ?? extractAccounts(allTransactions)
			// Update cache with payees and accounts if they were missing
			if (!cached.payees || !cached.accounts) {
				if (fileInfo?.fileName && fileInfo?.modifiedAt) {
					await filterOptionsStore.setAsync({
						...cached,
						payees: availablePayees,
						accounts: availableAccounts,
					})
				}
			}
			return
		}

		const categoryTransactions = allTransactions.filter(
			(trx) => 'category' in trx
		)
		availableCategories = extractCategories(
			categoryTransactions as { category?: ParsedCategory }[]
		)
		availablePayees = extractPayees(allTransactions as { payee?: string }[])
		availableAccounts = extractAccounts(allTransactions)
		tagCategories = extractTagCategories(allTransactions)
		if (fileInfo?.fileName && fileInfo?.modifiedAt) {
			await filterOptionsStore.setAsync({
				categories: availableCategories,
				tags: tagCategories,
				payees: availablePayees,
				accounts: availableAccounts,
				fileName: fileInfo.fileName,
				modifiedAt: fileInfo.modifiedAt,
			})
		}
	}

	onMount(() => {
		cachedFilterOptions = get(filterOptionsStore)
		const unsubFilterOptions = filterOptionsStore.subscribe(
			(options: FilterOptions | undefined) => {
				cachedFilterOptions = options
			}
		)
		loadData().then(() => {
			// Load persisted filters after data is loaded
			const persistedDateRange = loadPersistedDateRange()
			const persistedFilterSelection = loadPersistedFilterSelection()

			if (persistedDateRange || persistedFilterSelection) {
				filterState = {
					...filterState,
					dateRange: persistedDateRange || filterState.dateRange,
					...persistedFilterSelection,
				}
			}
			didHydrateDateFilter = true
		})
		const unsubDatabaseStore = databaseStore.subscribe((state) => {
			fileInfo = state
			loadData().then(() => {
				// Re-apply persisted filters after data reload
				const persistedDateRange = loadPersistedDateRange()
				const persistedFilterSelection = loadPersistedFilterSelection()

				if (persistedDateRange || persistedFilterSelection) {
					filterState = {
						...filterState,
						dateRange: persistedDateRange || filterState.dateRange,
						...persistedFilterSelection,
					}
				}
			})
		})
		const unsubDatabaseUploading = databaseUploading.subscribe((u: boolean) => {
			uploading = u
		})

		return () => {
			unsubFilterOptions()
			unsubDatabaseStore()
			unsubDatabaseUploading()
		}
	})

	$effect(() => {
		if (!didHydrateDateFilter) return
		persistDateRange(filterState.dateRange)
	})

	$effect(() => {
		if (!didHydrateDateFilter) return
		// Persist all filter selections except date range
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { dateRange, ...filterSelection } = filterState
		persistFilterSelection(filterSelection)
	})

	const applyNonDateFilters = (
		transactions: ParsedTransaction[]
	): ParsedTransaction[] => {
		let result = transactions
		const filters = []

		if (filterState.transactionTypes.length > 0) {
			filters.push(
				byTransactionType({
					types: filterState.transactionTypes,
					mode: filterState.transactionTypeMode,
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

		if (filterState.payees.length > 0) {
			filters.push(byPayee({ payees: filterState.payees }))
		}

		if (filterState.accounts.length > 0) {
			filters.push(byAccount({ accounts: filterState.accounts }))
		}

		if (filters.length > 0) {
			result = filter(transactions, ...filters)
		}

		return result
	}

	const nonDateFilteredTransactions = $derived(
		applyNonDateFilters(allTransactions)
	)

	const filteredTransactions = $derived.by(() => {
		let result = nonDateFilteredTransactions
		const dateFilters = []

		if (filterState.dateRange.start && filterState.dateRange.end) {
			dateFilters.push(
				byDateRange(filterState.dateRange.start, filterState.dateRange.end)
			)
		} else if (filterState.dateRange.start) {
			dateFilters.push(byDateRange(filterState.dateRange.start, new Date()))
		} else if (filterState.dateRange.end) {
			dateFilters.push(byDateRange(new Date(0), filterState.dateRange.end))
		}

		if (dateFilters.length > 0) {
			result = filter(result, ...dateFilters)
		}

		return result
	})

	const statsCurrentRange = $derived(
		deriveCurrentRange(
			nonDateFilteredTransactions,
			filterState.dateRange.start,
			filterState.dateRange.end
		)
	)

	const statsBaselineRange = $derived(deriveBaselineRange(statsCurrentRange))

	const statsCurrentTransactions = $derived(
		sliceByDateRange(nonDateFilteredTransactions, statsCurrentRange)
	)

	const statsBaselineTransactions = $derived(
		sliceByDateRange(nonDateFilteredTransactions, statsBaselineRange)
	)

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
		data-testid="transaction-count"
	/>

	{#if totalCount > 0}
		<FilterBar
			bind:filterState
			{availableCategories}
			{availablePayees}
			{availableAccounts}
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
		statsTransactions={statsCurrentTransactions}
		{statsBaselineTransactions}
		{statsCurrentRange}
		{statsBaselineRange}
		totalCount={filteredCount}
		{uploading}
		{limit}
		onlimitchange={(newLimit) => (limit = newLimit)}
		hasData={totalCount > 0}
		class="mt-6 mb-8"
	/>
</AppBody>
