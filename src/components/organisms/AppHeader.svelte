<script lang="ts">
	import Container from '$components/atoms/Container.svelte'
	import Header from '$components/atoms/Header.svelte'
	import GitHubButton from '$components/molecules/GitHubButton.svelte'
	import NameHeader from '$components/molecules/NameHeader.svelte'
	import ThemeSelect from '$components/molecules/ThemeSelect.svelte'
</script>

<Header>
	<NameHeader />
	<Container class="items-stretch gap-x-3">
		<GitHubButton />
		<ThemeSelect />
	</Container>
</Header>
