<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import TabSwitcher from '$components/molecules/TabSwitcher.svelte'
	import TransactionTable from '$components/molecules/TransactionTable.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			limit?: number
		}>

	let {
		transactions,
		totalCount = 0,
		limit = 0,
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

<div class={mergeClass(['flex flex-col'], className)} {...rest}>
	<TabSwitcher
		{tabs}
		{activeTab}
		onchange={(id) => (activeTab = id)}
		class="z-10 -mb-px px-4"
	/>

	<div
		class="rounded-box rounded-tl-none border border-base-300 bg-base-100 p-6"
	>
		{#if activeTab === 'transactions'}
			<TransactionTable {transactions} {totalCount} {limit} />
		{:else if activeTab === 'analytics'}
			<div class="py-12 text-center opacity-60">
				<p class="text-xl font-bold">Analytics coming soon...</p>
				<p class="text-sm">Charts and graphs will appear here</p>
			</div>
		{:else if activeTab === 'categories'}
			<div class="py-12 text-center opacity-60">
				<p class="text-xl font-bold">Categories coming soon...</p>
				<p class="text-sm">Category breakdown will appear here</p>
			</div>
		{/if}
	</div>
</div>
