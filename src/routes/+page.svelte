<script lang="ts">
	import type { ParsedCsv } from '$lib/csv/models'
	import { onMount } from 'svelte'

	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	import { csvAPIs, csvStore } from '$lib/csv'

	let data = $state<ParsedCsv | undefined>(undefined)
	onMount(() => {
		csvStore.subscribe(() => {
			csvAPIs.read().then((res) => {
				data = res
			})
		})
	})
</script>

<AppBody>
	<BodyHeader />

	{#if data}
		<span class="mt-6">Total transactions: {data.rows.length}</span>
		<pre>{JSON.stringify(data.rows.slice(0, 20), null, 2)}</pre>
	{/if}
</AppBody>
