<script lang="ts">
	import Container from '$components/atoms/Container.svelte'
	import SubtitleHead from '$components/molecules/SubtitleHead.svelte'
	import TitleHead from '$components/molecules/TitleHead.svelte'
</script>

<Container class="flex-col">
	<TitleHead name="report.csv" />
	<SubtitleHead startDate="2024-01-01" endDate="2024-12-31" total={1234} />
</Container>
