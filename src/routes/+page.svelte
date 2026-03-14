<script lang="ts">
	import type { DataController } from '$lib/app/controllers/index.js'
	import type { FilterOptions, FilterState } from '$lib/app/filters'
	import type { FilterState as AppFilterState } from '$lib/app/sessions/types.js'
	import type {
		DataTransaction,
		TransactionType,
		FxRateTable,
		SourceManifest,
		ParsedCategory,
		ParsedTransactionType,
		ParsedTransaction,
	} from '$lib/types'
	import { onDestroy, onMount } from 'svelte'
	import { get } from 'svelte/store'

	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import Dashboard from '$components/organisms/Dashboard.svelte'
	import FilterBar from '$components/organisms/FilterBar.svelte'
	import {
		sessionStore,
		sessionUploading,
		extractCategories,
		extractPayees,
		extractTagCategories,
		extractAccounts,
	} from '$lib/app'
	import { createCurrencyController } from '$lib/app/controllers/index.js'
	import {
		deriveBaselineRange,
		deriveCurrentRange,
		loadLegacyDashboardSnapshot,
		sliceByDateRange,
		summarizeTransactions,
		toLegacyFxConversionResult,
	} from '$lib/app/dashboard/index.js'
	import {
		getDefaultDateRange,
		loadPersistedDateRange,
		persistDateRange,
		loadPersistedFilterSelection,
		persistFilterSelection,
		filterOptionsStore,
		emptyFilterState,
	} from '$lib/app/filters'
	import { dismissNotification, pushNotification } from '$lib/ui'

	const DEFAULT_TRANSACTION_PAGE_SIZE = 10
	const TRANSACTION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
	const currencyController = createCurrencyController()

	let allTransactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)
	let availableCategories = $state(extractCategories([]))
	let availablePayees = $state<string[]>([])
	let availableAccounts = $state<string[]>([])
	let tagCategories = $state(extractTagCategories([]))
	let cachedFilterOptions = $state<FilterOptions | undefined>(undefined)
	let dataController = $state<DataController | undefined>(undefined)
	let transactionById = $state(new Map<number, ParsedTransaction>())
	let fileInfo = $state<SourceManifest | undefined>(undefined)
	let dataLoading = $state(true)
	let dataLoadRequestId = 0
	let uploading = $state(false)
	let filterState = $state<FilterState>({
		...emptyFilterState(),
		dateRange: getDefaultDateRange(),
	})
	let transactionPage = $state(1)
	let transactionPageSize = $state(DEFAULT_TRANSACTION_PAGE_SIZE)
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

	const PARSED_TO_DATA_TYPE: Record<ParsedTransactionType, TransactionType> = {
		Income: 'income',
		Expense: 'expense',
		Refund: 'refund',
		Windfall: 'windfall',
		Giveaway: 'giveaway',
		Debt: 'debt',
		DebtRepayment: 'debt_repayment',
		Transfer: 'transfer',
		Reconcile: 'reconcile',
		Buy: 'buy',
		Sell: 'sell',
		Unknown: 'unknown',
	}

	const toControllerFilterState = (
		state: FilterState,
		controller: DataController
	): AppFilterState => {
		const selectedAccounts = new Set(state.accounts)
		const accountIds = controller
			.getAllAccounts()
			.filter((account) => selectedAccounts.has(account.name))
			.map((account) => account.id)

		const start = state.dateRange.start
		const end = state.dateRange.end

		return {
			dateRange:
				start || end
					? {
							start: start ?? new Date(0),
							end: end ?? new Date(),
						}
					: undefined,
			transactionTypes: state.transactionTypes.map(
				(type) => PARSED_TO_DATA_TYPE[type]
			),
			transactionTypeMode: state.transactionTypeMode,
			categories: state.categories,
			categoryMode: state.categoryMode,
			payees: state.payees,
			accounts: accountIds,
			tags: state.tags,
		}
	}

	const queryTransactions = (
		controller: DataController,
		state: FilterState
	): DataTransaction[] => {
		return controller.getTransactions(
			toControllerFilterState(state, controller)
		)
	}

	const mapTransactions = (
		transactions: readonly DataTransaction[]
	): ParsedTransaction[] => {
		return transactions.flatMap((transaction) => {
			const parsed = transactionById.get(transaction.id)
			return parsed ? [parsed] : []
		})
	}

	const refreshHistoricalRateTable = async (
		transactions: readonly DataTransaction[]
	): Promise<void> => {
		const requestId = ++fxRateRequestId
		fxRateLoading = true
		fxRateError = undefined
		fxRateTable = {
			baseCurrency: 'THB',
			rates: {},
		}

		try {
			const next = await currencyController.fetchRates(transactions)
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
		const { transactionCount, transactions, controller } =
			await loadLegacyDashboardSnapshot()
		totalCount = transactionCount
		dataController = controller
		allTransactions = [...transactions]
		transactionById = new Map(
			transactions.flatMap((transaction) =>
				transaction.id !== undefined
					? [[transaction.id, transaction] as const]
					: []
			)
		)
		void refreshHistoricalRateTable(controller.getAllTransactions())
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

	const reloadData = async () => {
		const requestId = ++dataLoadRequestId
		dataLoading = true

		try {
			await loadData()
			if (requestId !== dataLoadRequestId) return

			const persistedDateRange = loadPersistedDateRange()
			const persistedFilterSelection = loadPersistedFilterSelection()

			filterState = {
				...filterState,
				dateRange: persistedDateRange || getDefaultDateRange(),
				...persistedFilterSelection,
			}
			didHydrateDateFilter = true
		} finally {
			if (requestId === dataLoadRequestId) {
				dataLoading = false
			}
		}
	}

	onMount(() => {
		cachedFilterOptions = get(filterOptionsStore)
		const unsubFilterOptions = filterOptionsStore.subscribe(
			(options: FilterOptions | undefined) => {
				cachedFilterOptions = options
			}
		)
		const unsubSessionStore = sessionStore.subscribe((state) => {
			fileInfo = state.source
			void reloadData()
		})
		const unsubSessionUploading = sessionUploading.subscribe((u: boolean) => {
			uploading = u
		})

		return () => {
			unsubFilterOptions()
			unsubSessionStore()
			unsubSessionUploading()
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

	const dateAndTypeFilteredDataTransactions = $derived(
		dataController
			? queryTransactions(dataController, {
					...filterState,
					categories: [],
					payees: [],
					accounts: [],
					tags: [],
				})
			: []
	)

	const dateAndTypeFilteredTransactions = $derived(
		mapTransactions(dateAndTypeFilteredDataTransactions)
	)

	const secondLayerFilteredDataTransactions = $derived(
		dataController
			? queryTransactions(dataController, {
					...filterState,
					tags: [],
				})
			: []
	)

	const secondLayerFilteredTransactions = $derived(
		mapTransactions(secondLayerFilteredDataTransactions)
	)

	const filteredDataTransactions = $derived(
		dataController ? queryTransactions(dataController, filterState) : []
	)

	const filteredTransactions = $derived(
		mapTransactions(filteredDataTransactions)
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

	const nonDateFilteredDataTransactions = $derived(
		dataController
			? queryTransactions(dataController, {
					...filterState,
					dateRange: {
						start: undefined,
						end: undefined,
					},
				})
			: []
	)

	const convertedFilteredResult = $derived.by(() => {
		if (fxRateLoading) return undefined
		return toLegacyFxConversionResult(
			currencyController.convert(filteredDataTransactions, fxRateTable),
			transactionById
		)
	})

	const convertedFilteredTransactions = $derived(
		convertedFilteredResult?.transactions ?? []
	)

	const convertedNonDateFilteredTransactions = $derived.by(() => {
		if (fxRateLoading) return []
		return toLegacyFxConversionResult(
			currencyController.convert(nonDateFilteredDataTransactions, fxRateTable),
			transactionById
		).transactions
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
		return summarizeTransactions(
			toLegacyFxConversionResult(
				currencyController.convert(filteredDataTransactions, fxRateTable),
				transactionById
			).transactions.map((transaction) => ({
				id: transaction.id ?? 0,
				type: PARSED_TO_DATA_TYPE[transaction.type],
				date: transaction.date,
				amount: transaction.amount.value,
				currency: transaction.amount.currency,
				category:
					'category' in transaction ? transaction.category.category : '',
				subcategory:
					'category' in transaction ? transaction.category.subcategory : '',
				payee: 'payee' in transaction ? transaction.payee : '',
				accountId: 0,
				accountName: transaction.account.name,
				notes: transaction.memo,
				tags: transaction.tags.map((tag) => ({
					category: tag.category,
					name: tag.name,
				})),
			}))
		)
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
		return summarizeTransactions(
			cashFlowBaselineTransactions.map((transaction) => ({
				id: transaction.id ?? 0,
				type: PARSED_TO_DATA_TYPE[transaction.type],
				date: transaction.date,
				amount: transaction.amount.value,
				currency: transaction.amount.currency,
				category:
					'category' in transaction ? transaction.category.category : '',
				subcategory:
					'category' in transaction ? transaction.category.subcategory : '',
				payee: 'payee' in transaction ? transaction.payee : '',
				accountId: 0,
				accountName: transaction.account.name,
				notes: transaction.memo,
				tags: transaction.tags.map((tag) => ({
					category: tag.category,
					name: tag.name,
				})),
			}))
		)
	})

	const sortedFilteredTransactions = $derived(
		filteredTransactions.toSorted((a, b) => b.date.getTime() - a.date.getTime())
	)

	const filteredCount = $derived(sortedFilteredTransactions.length)

	const totalTransactionPages = $derived(
		Math.max(1, Math.ceil(filteredCount / transactionPageSize))
	)

	$effect(() => {
		if (sortedFilteredTransactions) {
			transactionPage = 1
		}
	})

	const setTransactionPage = (nextPage: number) => {
		const safePage = Math.min(
			totalTransactionPages,
			Math.max(1, Math.trunc(nextPage))
		)
		transactionPage = safePage
	}

	const setTransactionPageSize = (nextPageSize: number) => {
		if (!TRANSACTION_PAGE_SIZE_OPTIONS.includes(nextPageSize)) return
		transactionPageSize = nextPageSize
		transactionPage = 1
	}

	$effect(() => {
		if (transactionPage > totalTransactionPages) {
			transactionPage = totalTransactionPages
		}
	})

	const displayTransactions = $derived.by(() => {
		const start = (transactionPage - 1) * transactionPageSize
		const end = start + transactionPageSize
		return sortedFilteredTransactions.slice(start, end)
	})
</script>

<AppBody>
	<BodyHeader
		fileName={dataLoading ? 'Loading saved data...' : fileInfo?.fileName}
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
		loading={uploading || dataLoading || fxRateLoading}
		page={transactionPage}
		pageSize={transactionPageSize}
		totalPages={totalTransactionPages}
		summary={filteredSummary}
		baselineSummary={quickSummaryBaseline}
		onpagechange={setTransactionPage}
		onpagesizechange={setTransactionPageSize}
		hasData={totalCount > 0}
		class="mt-6 mb-8"
	/>
</AppBody>
