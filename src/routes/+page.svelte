<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { CsvState } from '$lib/csv/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { onMount } from 'svelte'

	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import Dashboard from '$components/organisms/Dashboard.svelte'
	import QuickSummary from '$components/organisms/QuickSummary.svelte'
	import { bySummarize, transform } from '$lib/analytics/transforms'
	import { csvStore } from '$lib/csv'
	import { getTransactionCount, getTransactions } from '$lib/transactions'

	const LIMIT = 20

	let transactions = $state<ParsedTransaction[]>([])
	let allTransactions = $state<ParsedTransaction[]>([])
	let totalCount = $state(0)
	let fileInfo = $state<CsvState | undefined>(undefined)
	let summary = $state<Summarize | undefined>(undefined)

	const loadData = async () => {
		totalCount = await getTransactionCount()
		transactions = await getTransactions(LIMIT)
		allTransactions = await getTransactions()

		if (allTransactions.length > 0) {
			summary = transform(allTransactions, bySummarize())
		} else {
			summary = undefined
		}
	}

	onMount(() => {
		loadData()
		csvStore.subscribe((state) => {
			fileInfo = state
			loadData()
		})
	})
</script>

<AppBody>
	<BodyHeader
		fileName={fileInfo?.fileName}
		startDate={summary?.dateRange.start}
		endDate={summary?.dateRange.end}
		totalRows={totalCount}
	/>

	{#if summary}
		<QuickSummary {summary} class="mt-6" />
	{/if}

	<Dashboard {transactions} {totalCount} limit={LIMIT} class="mt-6" />
</AppBody>
