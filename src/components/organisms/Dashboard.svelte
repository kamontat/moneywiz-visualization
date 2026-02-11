<script lang="ts">
	import type { StatsRange } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import BanknoteIcon from '@iconify-svelte/lucide/banknote'
	import ChartPieIcon from '@iconify-svelte/lucide/chart-pie'
	import FlaskConicalIcon from '@iconify-svelte/lucide/flask-conical'
	import FolderIcon from '@iconify-svelte/lucide/folder'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'

	import Skeleton from '$components/atoms/Skeleton.svelte'
	import UploadPrompt from '$components/atoms/UploadPrompt.svelte'
	import TabSwitcher from '$components/molecules/TabSwitcher.svelte'
	import TransactionPanel from '$components/molecules/TransactionPanel.svelte'
	import AnalyticsPanel from '$components/organisms/AnalyticsPanel.svelte'
	import CategoriesPanel from '$components/organisms/CategoriesPanel.svelte'
	import ExperimentsPanel from '$components/organisms/ExperimentsPanel.svelte'
	import StatsPanel from '$components/organisms/StatsPanel.svelte'
	import { mergeClass } from '$lib/components'
	import { themeStore } from '$lib/themes'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			allTransactions?: ParsedTransaction[]
			totalCount?: number
			limit?: number
			hasData?: boolean
			uploading?: boolean
			statsTransactions?: ParsedTransaction[]
			statsBaselineTransactions?: ParsedTransaction[]
			statsCurrentRange?: StatsRange | null
			statsBaselineRange?: StatsRange | null
			onlimitchange?: (limit: number) => void
		}>

	let {
		transactions,
		allTransactions: _allTransactions = [],
		totalCount = 0,
		limit = 0,
		hasData = false,
		uploading = false,
		statsTransactions = [],
		statsBaselineTransactions = [],
		statsCurrentRange = null,
		statsBaselineRange = null,
		onlimitchange,
		class: className,
		...rest
	}: Props = $props()

	let activeTab = $state('analytics')

	const tabs = [
		{ id: 'analytics', label: 'Analytics', icon: ChartPieIcon },
		{ id: 'categories', label: 'Categories', icon: FolderIcon },
		{ id: 'stats', label: 'Stats', icon: TrendingUpIcon },
		{ id: 'transactions', label: 'Transactions', icon: BanknoteIcon },
		{ id: 'experiments', label: 'Experiments', icon: FlaskConicalIcon },
	]
</script>

<div class={mergeClass(['flex flex-col gap-6'], className)} {...rest}>
	{#if hasData}
		<TabSwitcher {tabs} {activeTab} onchange={(id) => (activeTab = id)} />
	{/if}

	<div class="rounded-box bg-base-100 shadow-sm">
		{#key `${$themeStore.theme.name}:${activeTab}:${hasData}:${uploading}`}
			{#if uploading}
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
						{limit}
						{onlimitchange}
						title="Transactions"
					/>
				</div>
			{:else if activeTab === 'analytics'}
				<div class="p-4 sm:p-6">
					<AnalyticsPanel transactions={_allTransactions} />
				</div>
			{:else if activeTab === 'experiments'}
				<div class="p-4 sm:p-6">
					<ExperimentsPanel transactions={_allTransactions} />
				</div>
			{:else if activeTab === 'stats'}
				<div class="p-4 sm:p-6">
					<StatsPanel
						transactions={statsTransactions}
						baselineTransactions={statsBaselineTransactions}
						currentRange={statsCurrentRange}
						baselineRange={statsBaselineRange}
					/>
				</div>
			{:else if activeTab === 'categories'}
				<div class="p-4 sm:p-6">
					<CategoriesPanel transactions={_allTransactions} />
				</div>
			{/if}
		{/key}
	</div>
</div>
