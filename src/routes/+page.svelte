<script lang="ts">
	import AppBody from '$components/organisms/AppBody.svelte'
	import { trxStore } from '$lib/stores'

	let tests = Array.from({ length: 0 }, (_, k) => k + 1)
</script>

<AppBody>
	{#each tests as i (i)}
		<h1>hello world {i}</h1>
	{/each}
	<span>Total transactions: {$trxStore.data.length}</span>
	<pre>{JSON.stringify($trxStore.data.slice(0, 20), null, 2)}</pre>
</AppBody>
