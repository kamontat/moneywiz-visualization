<script lang="ts">
	import type { FilterOptions } from '$lib/analytics/filters/models/options'
	import type { FilterState } from '$lib/analytics/filters/models/state'
	import type { FxRateTable } from '$lib/currency/models'
	import type { DatabaseState } from '$lib/database/models'
	import type {
		ParsedCategory,
		ParsedTransaction,
	} from '$lib/transactions/models'
	import { onDestroy, onMount } from 'svelte'
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
		getDefaultDateRange,
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
	import {
		convertTransactionsToTHB,
		prepareHistoricalRateTable,
	} from '$lib/currency'
	import { databaseStore, databaseUploading } from '$lib/database'
	import { dismissNotification, pushNotification } from '$lib/notifications'
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
	let filterState = $state<FilterState>({
		...emptyFilterState(),
		dateRange: getDefaultDateRange(),
	})
	let limit = $state(DEFAULT_LIMIT)
	let didHydrateDateFilter = $state(false)
	let fxRateTable = $state<FxRateTable>({
		baseCurrency: 'THB',
		rates: {},
	})
	let fxRateLoading = $state(false)
	let fxRateError = $state<string | undefined>(undefined)
	let fxRateRequestId = 0
	let fxRateLoadingNotificationId = $state<string | undefined>(undefined)
	let fxRateErrorNotificationId = $state<string | undefined>(undefined)
	let fxRateErrorNotificationText = $state<string | undefined>(undefined)
	let normalizationNotificationId = $state<string | undefined>(undefined)
	let normalizationNotificationText = $state<string | undefined>(undefined)

	const refreshHistoricalRateTable = async (
		transactions: ParsedTransaction[]
	): Promise<void> => {
		const requestId = ++fxRateRequestId
		fxRateLoading = true
		fxRateError = undefined
		fxRateTable = {
			baseCurrency: 'THB',
			rates: {},
		}

		try {
			const next = await prepareHistoricalRateTable(transactions)
			if (requestId !== fxRateRequestId) return
			fxRateTable = next
		} catch (error) {
			if (requestId !== fxRateRequestId) return
			fxRateError =
				error instanceof Error
					? error.message
					: 'Unable to prepare historical FX rates'
		} finally {
			if (requestId === fxRateRequestId) {
				fxRateLoading = false
			}
		}
	}

	const loadData = async () => {
		totalCount = await getTransactionCount()
		allTransactions = await getTransactions()
		void refreshHistoricalRateTable(allTransactions)
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

			filterState = {
				...filterState,
				dateRange: persistedDateRange || getDefaultDateRange(),
				...persistedFilterSelection,
			}
			didHydrateDateFilter = true
		})
		const unsubDatabaseStore = databaseStore.subscribe((state) => {
			fileInfo = state
			loadData().then(() => {
				// Re-apply persisted filters after data reload
				const persistedDateRange = loadPersistedDateRange()
				const persistedFilterSelection = loadPersistedFilterSelection()

				filterState = {
					...filterState,
					dateRange: persistedDateRange || getDefaultDateRange(),
					...persistedFilterSelection,
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

	const applyDateFilter = (
		transactions: ParsedTransaction[]
	): ParsedTransaction[] => {
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

		return dateFilters.length > 0
			? filter(transactions, ...dateFilters)
			: transactions
	}

	const applyTypeFilter = (
		transactions: ParsedTransaction[]
	): ParsedTransaction[] => {
		if (filterState.transactionTypes.length > 0) {
			return filter(
				transactions,
				byTransactionType({
					types: filterState.transactionTypes,
					mode: filterState.transactionTypeMode,
				})
			)
		}
		return transactions
	}

	const applySecondLayerFilters = (
		transactions: ParsedTransaction[]
	): ParsedTransaction[] => {
		const filters = []

		if (filterState.categories.length > 0) {
			filters.push(
				byCategory({
					categories: filterState.categories,
					mode: filterState.categoryMode,
				})
			)
		}

		if (filterState.payees.length > 0) {
			filters.push(byPayee({ payees: filterState.payees }))
		}

		if (filterState.accounts.length > 0) {
			filters.push(byAccount({ accounts: filterState.accounts }))
		}

		return filters.length > 0 ? filter(transactions, ...filters) : transactions
	}

	const applyTagFilters = (
		transactions: ParsedTransaction[]
	): ParsedTransaction[] => {
		if (filterState.tags.length > 0) {
			return filter(
				transactions,
				byTags(
					...filterState.tags.map((t) => ({
						category: t.category,
						values: t.values,
						mode: t.mode,
					}))
				)
			)
		}
		return transactions
	}

	// Cascading filter pipeline: Date → Types → Category/Payee/Account → Tags
	const dateFilteredTransactions = $derived(applyDateFilter(allTransactions))

	const dateAndTypeFilteredTransactions = $derived(
		applyTypeFilter(dateFilteredTransactions)
	)

	const secondLayerFilteredTransactions = $derived(
		applySecondLayerFilters(dateAndTypeFilteredTransactions)
	)

	const filteredTransactions = $derived(
		applyTagFilters(secondLayerFilteredTransactions)
	)

	// Recalculate available Categories/Payees/Accounts when date/type filters change
	$effect(() => {
		const transactions = dateAndTypeFilteredTransactions
		const id = requestAnimationFrame(() => {
			const catTrx = transactions.filter((t) => 'category' in t)
			availableCategories = extractCategories(
				catTrx as { category?: ParsedCategory }[]
			)
			availablePayees = extractPayees(transactions as { payee?: string }[])
			availableAccounts = extractAccounts(transactions)
		})
		return () => cancelAnimationFrame(id)
	})

	// Recalculate available Tags when category/payee/account filters change
	$effect(() => {
		const transactions = secondLayerFilteredTransactions
		const id = requestAnimationFrame(() => {
			tagCategories = extractTagCategories(transactions)
		})
		return () => cancelAnimationFrame(id)
	})

	// nonDateFilteredTransactions: used for stats comparison (all filters except date)
	const nonDateFilteredTransactions = $derived(
		applyTagFilters(applySecondLayerFilters(applyTypeFilter(allTransactions)))
	)

	const convertedFilteredResult = $derived.by(() => {
		if (fxRateLoading) return undefined
		return convertTransactionsToTHB(filteredTransactions, fxRateTable)
	})

	const convertedFilteredTransactions = $derived(
		convertedFilteredResult?.transactions ?? []
	)

	const convertedNonDateFilteredTransactions = $derived.by(() => {
		if (fxRateLoading) return []
		return convertTransactionsToTHB(nonDateFilteredTransactions, fxRateTable)
			.transactions
	})

	const filteredConversionSummary = $derived(convertedFilteredResult?.summary)
	const showNormalizationAlert = $derived.by(() => {
		if (!filteredConversionSummary) return false

		return (
			filteredConversionSummary.estimatedCount > 0 ||
			filteredConversionSummary.unresolvedCount > 0
		)
	})

	const unresolvedCurrenciesLabel = $derived.by(() => {
		if (!filteredConversionSummary) return ''
		return Object.entries(filteredConversionSummary.unresolvedByCurrency)
			.map(([currency, count]) => `${currency} (${count})`)
			.join(', ')
	})

	$effect(() => {
		if (!totalCount || !fxRateLoading) {
			if (fxRateLoadingNotificationId) {
				dismissNotification(fxRateLoadingNotificationId)
			}
			fxRateLoadingNotificationId = undefined
			return
		}

		if (!fxRateLoadingNotificationId) {
			fxRateLoadingNotificationId = pushNotification({
				variant: 'info',
				text: 'Preparing historical FX rates. Analytics panels will update when ready.',
			})
		}
	})

	$effect(() => {
		if (!fxRateError) {
			if (fxRateErrorNotificationId) {
				dismissNotification(fxRateErrorNotificationId)
			}
			fxRateErrorNotificationId = undefined
			fxRateErrorNotificationText = undefined
			return
		}

		if (
			fxRateErrorNotificationId &&
			fxRateErrorNotificationText === fxRateError
		) {
			return
		}

		if (fxRateErrorNotificationId) {
			dismissNotification(fxRateErrorNotificationId)
		}

		fxRateErrorNotificationId = pushNotification({
			variant: 'error',
			text: fxRateError,
		})
		fxRateErrorNotificationText = fxRateError
	})

	$effect(() => {
		if (!showNormalizationAlert || !filteredConversionSummary) {
			if (normalizationNotificationId) {
				dismissNotification(normalizationNotificationId)
			}
			normalizationNotificationId = undefined
			normalizationNotificationText = undefined
			return
		}

		const unresolvedMessage =
			filteredConversionSummary.unresolvedCount > 0
				? ` Unresolved: ${filteredConversionSummary.unresolvedCount.toLocaleString()} (${unresolvedCurrenciesLabel}). These are excluded from analytics totals.`
				: ''
		const text = `Analytics amounts are normalized to THB using historical rates by transaction date. Estimated conversions: ${filteredConversionSummary.estimatedCount.toLocaleString()}.${unresolvedMessage}`

		if (normalizationNotificationId && normalizationNotificationText === text) {
			return
		}

		if (normalizationNotificationId) {
			dismissNotification(normalizationNotificationId)
		}

		normalizationNotificationId = pushNotification({
			variant: 'info',
			text,
		})
		normalizationNotificationText = text
	})

	onDestroy(() => {
		if (fxRateLoadingNotificationId) {
			dismissNotification(fxRateLoadingNotificationId)
		}
		if (fxRateErrorNotificationId) {
			dismissNotification(fxRateErrorNotificationId)
		}
		if (normalizationNotificationId) {
			dismissNotification(normalizationNotificationId)
		}
	})

	const statsCurrentRange = $derived(
		deriveCurrentRange(
			convertedNonDateFilteredTransactions,
			filterState.dateRange.start,
			filterState.dateRange.end
		)
	)

	const statsBaselineRange = $derived(deriveBaselineRange(statsCurrentRange))

	const statsCurrentTransactions = $derived(
		sliceByDateRange(convertedNonDateFilteredTransactions, statsCurrentRange)
	)

	const statsBaselineTransactions = $derived(
		sliceByDateRange(convertedNonDateFilteredTransactions, statsBaselineRange)
	)

	const filteredSummary = $derived.by(() => {
		if (convertedFilteredTransactions.length > 0) {
			return transform(convertedFilteredTransactions, bySummarize())
		}
		return undefined
	})

	const cashFlowCurrentRange = $derived.by(() => {
		if (!filteredSummary) return null

		return deriveCurrentRange(
			convertedNonDateFilteredTransactions,
			filteredSummary.dateRange.start,
			filteredSummary.dateRange.end
		)
	})

	const cashFlowBaselineRange = $derived(
		deriveBaselineRange(cashFlowCurrentRange)
	)

	const cashFlowBaselineTransactions = $derived(
		sliceByDateRange(
			convertedNonDateFilteredTransactions,
			cashFlowBaselineRange
		)
	)

	const quickSummaryBaseline = $derived.by(() => {
		if (cashFlowBaselineTransactions.length === 0) return undefined
		return transform(cashFlowBaselineTransactions, bySummarize())
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
		baselineStartDate={cashFlowBaselineRange?.start}
		baselineEndDate={cashFlowBaselineRange?.end}
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
		<QuickSummary
			summary={filteredSummary}
			baselineSummary={quickSummaryBaseline}
			class="mt-6"
		/>
	{/if}

	<Dashboard
		transactions={displayTransactions}
		allTransactions={convertedFilteredTransactions}
		{cashFlowBaselineTransactions}
		{cashFlowCurrentRange}
		{cashFlowBaselineRange}
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
