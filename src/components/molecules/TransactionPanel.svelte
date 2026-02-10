<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import Select from '$components/atoms/Select.svelte'
	import TransactionTable from '$components/molecules/TransactionTable.svelte'
	import { mergeClass } from '$lib/components'

	const PAGE_SIZES = [5, 10, 20, 50, 100]

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			limit?: number
			title?: string
			onlimitchange?: (limit: number) => void
		}>

	let {
		transactions,
		totalCount = 0,
		limit = 0,
		title,
		onlimitchange,
		class: className,
		...rest
	}: Props = $props()

	let selectedLimit = $derived(String(limit))

	const pageSizeValues = PAGE_SIZES.map((size) => ({
		label: String(size),
		value: String(size),
	}))
</script>

<Panel class={mergeClass([], className)} {...rest}>
	<div class="mb-4 flex min-w-0 items-center gap-3">
		{#if title}
			<h3
				class="min-w-0 flex-1 truncate text-lg font-semibold text-base-content"
			>
				{title}
			</h3>
		{/if}
		{#if transactions.length > 0}
			<Select
				bind:value={selectedLimit}
				values={pageSizeValues}
				class="ml-auto w-auto min-w-14 shrink-0 d-select-sm text-sm"
				onchange={() => onlimitchange?.(Number(selectedLimit))}
			/>
		{/if}
	</div>
	<TransactionTable {transactions} {totalCount} />
</Panel>
