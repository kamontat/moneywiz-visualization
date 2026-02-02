<script lang="ts">
	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import { trxStore } from '$lib/transactions'

	let tests = Array.from({ length: 0 }, (_, k) => k + 1)
</script>

<AppBody>
	<BodyHeader />

	{#each tests as i (i)}
		<h1>hello world {i}</h1>
	{/each}
	<span>Total transactions: {$trxStore.data.length}</span>
	<pre>{JSON.stringify($trxStore.data.slice(0, 20), null, 2)}</pre>
</AppBody>
