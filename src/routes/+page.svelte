<script lang="ts">
	import AppBody from '$components/organisms/AppBody.svelte'

	let tests = Array.from({ length: 100 }, (_, k) => k + 1)
</script>

<AppBody>
	{#each tests as i (i)}
		<h1>hello world {i}</h1>
	{/each}
</AppBody>
