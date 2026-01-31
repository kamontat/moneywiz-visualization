<script lang="ts">
	import Container from '$components/atoms/Container.svelte'
	import Header from '$components/atoms/Header.svelte'
	import CsvClearButton from '$components/molecules/CsvClearButton.svelte'
	import CsvUploadButton from '$components/molecules/CsvUploadButton.svelte'
	import NameHeader from '$components/molecules/NameHeader.svelte'
	import ThemeSelect from '$components/molecules/ThemeSelect.svelte'
</script>

<Header>
	<NameHeader />
	<Container class="items-stretch gap-x-2">
		<CsvClearButton />
		<CsvUploadButton />
		<ThemeSelect />
	</Container>
</Header>
