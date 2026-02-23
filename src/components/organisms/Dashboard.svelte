<script lang="ts">
	import type {
		NetWorthSummary,
		StatsRange,
		Summarize,
	} from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import BanknoteIcon from '@iconify-svelte/lucide/banknote'
	import ChartPieIcon from '@iconify-svelte/lucide/chart-pie'
	import FolderIcon from '@iconify-svelte/lucide/folder'
	import LandmarkIcon from '@iconify-svelte/lucide/landmark'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'

	import Skeleton from '$components/atoms/Skeleton.svelte'
	import UploadPrompt from '$components/atoms/UploadPrompt.svelte'
	import TabSwitcher from '$components/molecules/TabSwitcher.svelte'
	import TransactionPanel from '$components/molecules/TransactionPanel.svelte'
	import AnalyticsPanel from '$components/organisms/AnalyticsPanel.svelte'
	import CashFlowPanel from '$components/organisms/CashFlowPanel.svelte'
	import CategoriesPanel from '$components/organisms/CategoriesPanel.svelte'
	import StatsPanel from '$components/organisms/StatsPanel.svelte'
	import { mergeClass } from '$lib/components'
	import { themeStore } from '$lib/themes'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			allTransactions?: ParsedTransaction[]
			cashFlowBaselineTransactions?: ParsedTransaction[]
			cashFlowCurrentRange?: StatsRange | null
			cashFlowBaselineRange?: StatsRange | null
			totalCount?: number
			page?: number
			pageSize?: number
			totalPages?: number
			hasData?: boolean
			loading?: boolean
			statsTransactions?: ParsedTransaction[]
			statsBaselineTransactions?: ParsedTransaction[]
			statsCurrentRange?: StatsRange | null
			statsBaselineRange?: StatsRange | null
			summary?: Summarize
			baselineSummary?: Summarize
			netWorthSummary?: NetWorthSummary
			onpagechange?: (page: number) => void
			onpagesizechange?: (pageSize: number) => void
		}>

	let {
		transactions,
		allTransactions: _allTransactions = [],
		cashFlowBaselineTransactions = [],
		cashFlowCurrentRange = null,
		cashFlowBaselineRange = null,
		totalCount = 0,
		page = 1,
		pageSize = 10,
		totalPages = 1,
		hasData = false,
		loading = false,
		statsTransactions = [],
		statsBaselineTransactions = [],
		statsCurrentRange = null,
		statsBaselineRange = null,
		summary,
		baselineSummary,
		netWorthSummary,
		onpagechange,
		onpagesizechange,
		class: className,
		...rest
	}: Props = $props()

	let activeTab = $state('overview')

	const tabs = [
		{
			id: 'overview',
			label: 'Overview',
			icon: ChartPieIcon,
			question: 'Summary of financial position for the selected period.',
		},
		{
			id: 'flow',
			label: 'Flow',
			icon: LandmarkIcon,
			question:
				'Trend and baseline comparison of income, expenses, and net flow.',
		},
		{
			id: 'drivers',
			label: 'Drivers',
			icon: FolderIcon,
			question: 'Breakdown of categories and payees contributing to results.',
		},
		{
			id: 'risk',
			label: 'Risk',
			icon: TrendingUpIcon,
			question: 'Stability, anomalies, and data-quality indicators over time.',
		},
		{
			id: 'transactions',
			label: 'Transactions',
			icon: BanknoteIcon,
			question: 'Detailed transaction records behind current analytics.',
		},
	]
</script>

<div class={mergeClass(['flex flex-col gap-6'], className)} {...rest}>
	{#if hasData}
		<TabSwitcher {tabs} {activeTab} onchange={(id) => (activeTab = id)} />
	{/if}

	<div class="rounded-box bg-base-100 shadow-sm">
		{#key `${$themeStore.theme.name}:${activeTab}:${hasData}:${loading}`}
			{#if loading}
				<div class="flex flex-col gap-4 p-4 sm:p-6">
					<div class="flex flex-col gap-4">
						<Skeleton variant="text" class="h-6 w-48" />
						<div class="flex flex-col gap-2">
							<Skeleton variant="text" />
							<Skeleton variant="text" />
							<Skeleton variant="text" />
							<Skeleton variant="text" class="w-3/4" />
						</div>
						<Skeleton variant="rectangle" class="h-48" />
					</div>
				</div>
			{:else if !hasData}
				<div class="p-4 sm:p-6">
					<UploadPrompt />
				</div>
			{:else if activeTab === 'transactions'}
				<div class="p-4 sm:p-6">
					<TransactionPanel
						{transactions}
						{totalCount}
						{page}
						{pageSize}
						{totalPages}
						{onpagechange}
						{onpagesizechange}
						title="Transactions"
						question="Detailed transaction records behind current analytics."
					/>
				</div>
			{:else if activeTab === 'overview'}
				<div class="p-4 sm:p-6">
					<AnalyticsPanel
						transactions={_allTransactions}
						{summary}
						{baselineSummary}
						{netWorthSummary}
					/>
				</div>
			{:else if activeTab === 'flow'}
				<div class="p-4 sm:p-6">
					<CashFlowPanel
						transactions={_allTransactions}
						baselineTransactions={cashFlowBaselineTransactions}
						currentRange={cashFlowCurrentRange}
						baselineRange={cashFlowBaselineRange}
					/>
				</div>
			{:else if activeTab === 'risk'}
				<div class="p-4 sm:p-6">
					<StatsPanel
						transactions={statsTransactions}
						baselineTransactions={statsBaselineTransactions}
						currentRange={statsCurrentRange}
						baselineRange={statsBaselineRange}
					/>
				</div>
			{:else if activeTab === 'drivers'}
				<div class="p-4 sm:p-6">
					<CategoriesPanel transactions={_allTransactions} />
				</div>
			{/if}
		{/key}
	</div>
</div>
