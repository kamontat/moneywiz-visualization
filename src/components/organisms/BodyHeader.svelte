<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
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

<div class="flex flex-col gap-2">
	<TitleHead name={fileName} />
	<SubtitleHead {startDate} {endDate} total={totalRows} />
</div>
