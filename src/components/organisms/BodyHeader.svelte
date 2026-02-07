<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import Container from '$components/atoms/Container.svelte'
	import SubtitleHead from '$components/molecules/SubtitleHead.svelte'
	import TitleHead from '$components/molecules/TitleHead.svelte'

	type Props = BaseProps &
		CustomProps<{
			fileName?: string
			startDate?: Date
			endDate?: Date
			totalRows?: number
		}>

	let {
		fileName = 'No file loaded',
		startDate,
		endDate,
		totalRows = 0,
		class: _className,
	}: Props = $props()
</script>

<Container class="flex-col">
	<TitleHead name={fileName} />
	<SubtitleHead {startDate} {endDate} total={totalRows} />
</Container>
