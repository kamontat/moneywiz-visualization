<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import Skeleton from '$components/atoms/Skeleton.svelte'
	import UploadPrompt from '$components/atoms/UploadPrompt.svelte'
	import TabSwitcher from '$components/molecules/TabSwitcher.svelte'
	import TransactionPanel from '$components/molecules/TransactionPanel.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			allTransactions?: ParsedTransaction[]
			totalCount?: number
			limit?: number
			hasData?: boolean
			uploading?: boolean
			onlimitchange?: (limit: number) => void
		}>

	let {
		transactions,
		allTransactions: _allTransactions = [],
		totalCount = 0,
		limit = 0,
		hasData = false,
		uploading = false,
		onlimitchange,
		class: className,
		...rest
	}: Props = $props()

	let activeTab = $state('transactions')

	const tabs = [
		{ id: 'transactions', label: '💰 Transactions' },
		{ id: 'analytics', label: '📊 Analytics' },
		{ id: 'categories', label: '📁 Categories' },
	]
</script>

<div class={mergeClass(['flex flex-col gap-6'], className)} {...rest}>
	<TabSwitcher {tabs} {activeTab} onchange={(id) => (activeTab = id)} />

	<div class="rounded-box bg-base-100 shadow-sm">
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
				<Panel title="Analytics">
					<div class="py-12 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200"
						>
							<span class="text-2xl">📊</span>
						</div>
						<p class="text-lg font-semibold text-base-content">
							Analytics coming soon
						</p>
						<p class="mt-1 text-sm text-base-content/60">
							Charts and graphs will appear here
						</p>
					</div>
				</Panel>
			</div>
		{:else if activeTab === 'categories'}
			<div class="p-4 sm:p-6">
				<Panel title="Categories">
					<div class="py-12 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200"
						>
							<span class="text-2xl">📁</span>
						</div>
						<p class="text-lg font-semibold text-base-content">
							Categories coming soon
						</p>
						<p class="mt-1 text-sm text-base-content/60">
							Category breakdown will appear here
						</p>
					</div>
				</Panel>
			</div>
		{/if}
	</div>
</div>
