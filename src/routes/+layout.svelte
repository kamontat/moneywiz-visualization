<script lang="ts">
	import AppHeader from '../components/organisms/AppHeader.svelte';
	import type { ParsedCsv } from '$lib/csv';
	import { csvStore } from '$lib/stores/csv';
	import './layout.css';

	let { children } = $props();

	// Use store as source of truth (automatically handles hydration)
	let parsedUpload = $derived(
		$csvStore.data && $csvStore.fileName
			? { fileName: $csvStore.fileName, data: $csvStore.data }
			: null
	);

	let errorMessage: string | null = $state(null);

	function handleParsed(detail: { file: File; data: ParsedCsv }) {
		errorMessage = null;

		// Publish to global store for the dashboard
		csvStore.set({ fileName: detail.file.name, data: detail.data });
	}

	function handleError(detail: { file: File | null; message: string }) {
		errorMessage = detail.message;

		// Clear store on error
		csvStore.set({ fileName: null, data: null });
	}

	function handleClear() {
		errorMessage = null;
		csvStore.reset();
	}
</script>

<div class="flex flex-col min-h-screen">
	<AppHeader onparsed={handleParsed} onerror={handleError} onclear={handleClear} csvLoaded={!!parsedUpload} />
	<main class="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-6 box-border">
		{@render children()}

		{#if errorMessage}
			<section
				class="m-0 p-4 border border-dashed border-orange-500 rounded-lg bg-orange-50 text-orange-800"
				role="alert"
			>
				<h2 class="text-lg font-bold mb-1">Upload failed</h2>
				<p>{errorMessage}</p>
			</section>
		{:else}
			<section class="blank-canvas flex-none min-h-6" aria-hidden="true"></section>
		{/if}
	</main>
</div>
