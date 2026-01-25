<script lang="ts">
	import AppHeader from '../components/organisms/AppHeader.svelte';
	import type { ParsedCsv } from '$lib/csv';
	import { csvStore } from '$lib/stores/csv';
	import './layout.css';

	let { children } = $props();

	let parsedUpload: { fileName: string; data: ParsedCsv } | null = $state(null);
	let errorMessage: string | null = $state(null);

	function handleParsed(detail: { file: File; data: ParsedCsv }) {
		parsedUpload = { fileName: detail.file.name, data: detail.data };
		errorMessage = null;

		// Publish to global store for the dashboard
		csvStore.set({ fileName: parsedUpload.fileName, data: parsedUpload.data });
	}

	function handleError(detail: { file: File | null; message: string }) {
		parsedUpload = null;
		errorMessage = detail.message;

		// Clear store on error
		csvStore.set({ fileName: null, data: null });
	}

	function handleClear() {
		parsedUpload = null;
		errorMessage = null;
		csvStore.reset();
	}

	const maxPreviewRows = 5;
</script>

<div class="flex flex-col min-h-screen">
	<AppHeader onparsed={handleParsed} onerror={handleError} onclear={handleClear} csvLoaded={!!parsedUpload} />
	<main class="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-6 box-border">
		{#if parsedUpload}
			<section class="bg-mw-surface border border-mw-border rounded-xl shadow-lg shadow-gray-900/5 flex flex-col gap-4 mb-5 p-5" aria-live="polite">
				<header class="flex flex-wrap justify-between items-start gap-x-4 gap-y-2">
					<div>
						<p class="text-mw-primary-dark text-sm font-bold uppercase tracking-wide m-0">Upload successful</p>
						<h1 class="text-mw-text-main text-2xl leading-tight mt-0.5 m-0">{parsedUpload.fileName}</h1>
					</div>
					<p class="text-mw-text-secondary font-semibold m-0">{(parsedUpload.data?.rows?.length ?? 0)} rows · {(parsedUpload.data?.headers?.length ?? 0)} columns</p>
				</header>

				{#if (parsedUpload.data?.rows?.length ?? 0) > 0}
					<div class="flex flex-col gap-2">
						<h2 class="text-mw-text-main text-lg m-0">Preview (first {Math.min(maxPreviewRows, parsedUpload.data?.rows?.length ?? 0)} rows)</h2>
						<div class="overflow-x-auto border border-mw-border rounded-lg">
							<table class="border-collapse" style="table-layout: auto; min-width: 100%;">
								<thead class="bg-gray-50">
									<tr class="border-b border-mw-border">
										{#each (parsedUpload.data?.headers ?? []) as header}
											<th scope="col" class="px-3 py-2 text-left text-sm font-bold text-mw-text-main whitespace-nowrap">{header}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each (parsedUpload.data?.rows ?? []).slice(0, maxPreviewRows) as row}
										<tr class="border-b border-mw-border">
											{#each (parsedUpload.data?.headers ?? []) as header}
												<td class="px-3 py-2 text-left text-sm text-mw-text-secondary overflow-hidden text-ellipsis">{row[header]}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else}
					<p class="m-0 p-4 border border-dashed border-amber-500 rounded-lg bg-amber-50 text-amber-800">No data rows found in this file.</p>
				{/if}
			</section>
		{:else if errorMessage}
			<section class="m-0 p-4 border border-dashed border-orange-500 rounded-lg bg-orange-50 text-orange-800" role="alert">
				<h2 class="text-lg font-bold mb-1">Upload failed</h2>
				<p>{errorMessage}</p>
			</section>
		{:else}
			<section class="blank-canvas flex-none min-h-6" aria-hidden="true"></section>
		{/if}

		{@render children()}
	</main>
</div>
