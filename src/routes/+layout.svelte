<script lang="ts">
	import AppHeader from '../components/AppHeader.svelte';
	import type { ParsedCsv } from '$lib/csv';
	import './layout.css';

	let { children } = $props();

	let parsedUpload: { fileName: string; data: ParsedCsv } | null = $state(null);
	let errorMessage: string | null = $state(null);

	function handleParsed(event: CustomEvent<{ file: File; data: ParsedCsv }>) {
		parsedUpload = { fileName: event.detail.file.name, data: event.detail.data };
		errorMessage = null;
	}

	function handleError(event: CustomEvent<{ file: File | null; message: string }>) {
		parsedUpload = null;
		errorMessage = event.detail.message;
	}

	const maxPreviewRows = 5;
</script>

<div class="app">
	<AppHeader on:parsed={handleParsed} on:error={handleError} />
	<main class="page-shell">
		{#if parsedUpload}
			<section class="upload-summary" aria-live="polite">
				<header class="summary-head">
					<div>
						<p class="eyebrow">Upload successful</p>
						<h1 class="file-name">{parsedUpload.fileName}</h1>
					</div>
					<p class="counts">{parsedUpload.data.rows.length} rows · {parsedUpload.data.headers.length} columns</p>
				</header>

				{#if parsedUpload.data.rows.length > 0}
					<div class="preview">
						<h2>Preview (first {Math.min(maxPreviewRows, parsedUpload.data.rows.length)} rows)</h2>
						<div class="table-wrapper">
							<table>
								<thead>
									<tr>
										{#each parsedUpload.data.headers as header}
											<th scope="col">{header}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each parsedUpload.data.rows.slice(0, maxPreviewRows) as row}
										<tr>
											{#each parsedUpload.data.headers as header}
												<td>{row[header]}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else}
					<p class="empty-preview">No data rows found in this file.</p>
				{/if}
			</section>
		{:else if errorMessage}
			<section class="upload-error" role="alert">
				<h2>Upload failed</h2>
				<p>{errorMessage}</p>
			</section>
		{:else}
			<section class="blank-canvas" aria-hidden="true"></section>
		{/if}

		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.page-shell {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.upload-summary {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		box-shadow: 0 14px 45px rgba(17, 24, 39, 0.08);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.25rem;
		padding: 1.25rem;
	}

	.summary-head {
		align-items: flex-start;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 1rem;
	}

	.eyebrow {
		color: #276749;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		margin: 0;
		text-transform: uppercase;
	}

	.file-name {
		color: #1f2937;
		font-size: 1.3rem;
		line-height: 1.3;
		margin: 0.1rem 0 0;
	}

	.counts {
		color: #4b5563;
		font-weight: 600;
		margin: 0;
	}

	.preview h2 {
		color: #111827;
		font-size: 1.05rem;
		margin: 0;
	}

	.table-wrapper {
		overflow: auto;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
	}

	table {
		border-collapse: collapse;
		min-width: 100%;
	}

	thead {
		background: #f9fafb;
	}

	th,
	td {
		border-bottom: 1px solid #e5e7eb;
		padding: 0.6rem 0.75rem;
		text-align: left;
		font-size: 0.95rem;
		color: #1f2937;
	}

	th {
		font-weight: 700;
		color: #111827;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.empty-preview,
	.upload-error {
		margin: 0;
		padding: 1rem;
		border: 1px dashed #f59e0b;
		border-radius: 10px;
		background: #fffaf0;
		color: #92400e;
	}

	.upload-error {
		border-color: #f97316;
		background: #fff7ed;
		color: #9a3412;
	}

	@media (max-width: 640px) {
		.page-shell {
			padding: 1.25rem 1rem;
		}

		.table-wrapper {
			max-width: 100%;
		}
	}
</style>
