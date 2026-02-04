<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import Text from '$components/atoms/Text.svelte'

	type Props = BaseProps &
		CustomProps<{
			startDate: string
			endDate: string
			total: number
		}>

	let { startDate, endDate, total }: Props = $props()
</script>

<Text tag="small">{startDate} - {endDate} | {total} rows total</Text>
