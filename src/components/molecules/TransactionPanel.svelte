<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import TransactionTable from '$components/molecules/TransactionTable.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			limit?: number
			title?: string
		}>

	let {
		transactions,
		totalCount = 0,
		limit = 0,
		title,
		class: className,
		...rest
	}: Props = $props()
</script>

<Panel {title} class={mergeClass([], className)} {...rest}>
	<TransactionTable {transactions} {totalCount} {limit} />
</Panel>
