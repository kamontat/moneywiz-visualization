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

	const maxPreviewRows = 5;

	// Collapsable preview state
	let isCollapsed = $state(true);

	// Icons
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import ChevronUpIcon from '@iconify-svelte/lucide/chevron-up';
</script>

<div class="flex flex-col min-h-screen">
	<AppHeader onparsed={handleParsed} onerror={handleError} onclear={handleClear} csvLoaded={!!parsedUpload} />
	<main class="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-6 box-border">
		{@render children()}

		{#if parsedUpload}
			<section
				class="bg-mw-surface border border-mw-border rounded-xl shadow-sm flex flex-col gap-4 mt-8"
				aria-live="polite"
			>
				<header class="flex flex-wrap justify-between items-center gap-4 px-4 py-3 border-b border-mw-border/50 bg-gray-50/50 rounded-t-xl">
					<h2 class="text-sm font-semibold text-mw-text-main m-0">Data Preview</h2>
					<button
						onclick={() => (isCollapsed = !isCollapsed)}
						class="inline-flex items-center gap-1 text-xs font-medium text-mw-text-muted hover:text-mw-text-main transition-colors"
						aria-expanded={!isCollapsed}
						aria-controls="preview-content"
					>
						{#if isCollapsed}
							Show Table <ChevronDownIcon class="w-3.5 h-3.5" />
						{:else}
							Hide Table <ChevronUpIcon class="w-3.5 h-3.5" />
						{/if}
					</button>
				</header>

				{#if !isCollapsed}
					<div id="preview-content" class="flex flex-col gap-2 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
						{#if (parsedUpload.data?.rows?.length ?? 0) > 0}
								<div class="overflow-x-auto border border-mw-border rounded-lg">
									<table class="border-collapse" style="table-layout: auto; min-width: 100%;">
										<thead class="bg-gray-50">
											<tr class="border-b border-mw-border">
												{#each (parsedUpload.data?.headers ?? []) as header}
													<th
														scope="col"
														class="px-3 py-2 text-left text-sm font-bold text-mw-text-main whitespace-nowrap"
														>{header}</th
													>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each (parsedUpload.data?.rows ?? []).slice(0, maxPreviewRows) as row}
												<tr class="border-b border-mw-border">
													{#each (parsedUpload.data?.headers ?? []) as header}
														<td
															class="px-3 py-2 text-left text-sm text-mw-text-secondary overflow-hidden text-ellipsis"
															>{row[header]}</td
														>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
						{:else}
							<p class="m-0 p-4 border border-dashed border-amber-500 rounded-lg bg-amber-50 text-amber-800">
								No data rows found in this file.
							</p>
						{/if}
					</div>
				{/if}
			</section>
		{:else if errorMessage}
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
