<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import Text from '$components/atoms/Text.svelte'

	type Props = BaseProps &
		CustomProps<{
			startDate?: Date
			endDate?: Date
			total: number
		}>

	let { startDate, endDate, total }: Props = $props()

	const formatDate = (d?: Date) =>
		d?.toLocaleDateString('th-TH', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
</script>

<Text tag="small">
	{#if startDate && endDate}
		{formatDate(startDate)} - {formatDate(endDate)}
	{:else}
		No date range
	{/if}
	| {total} rows total
</Text>
