<script lang="ts">
	import AppBody from '$components/organisms/AppBody.svelte'
	import BodyHeader from '$components/organisms/BodyHeader.svelte'
	// import { trxStore } from '$lib/transactions'
</script>

<AppBody>
	<BodyHeader />

	<!-- <span class="mt-6">Total transactions: {$trxStore.data.length}</span> -->
	<!-- <pre>{JSON.stringify($trxStore.data.slice(0, 20), null, 2)}</pre> -->
</AppBody>
