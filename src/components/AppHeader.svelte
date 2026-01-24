<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import CsvUploadButton from './CsvUploadButton.svelte';
	import MoneyLogo from './MoneyLogo.svelte';

	interface Props {
		onparsed?: (detail: { file: File; data: ParsedCsv }) => void;
		onerror?: (detail: { file: File | null; message: string }) => void;
		onclear?: () => void;
		csvLoaded?: boolean;
	}

	let { onparsed, onerror, onclear, csvLoaded = false }: Props = $props();
</script>

<header class="app-header">
	<div class="brand">
		<MoneyLogo size={28} />
		<div class="brand-text">
			<span class="app-name">MoneyWiz Visualization</span>
		</div>
	</div>

	<div class="actions">
		{#if csvLoaded}
			<button class="clear-button" type="button" onclick={onclear} aria-label="Clear loaded CSV">
				Clear
			</button>
		{/if}
		<CsvUploadButton {onparsed} {onerror} />
	</div>
</header>

<style>
	.app-header {
		align-items: center;
		background: #f7fbfd;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.brand {
		align-items: center;
		display: inline-flex;
		gap: 0.5rem;
		min-width: 0;
	}

	.brand-text {
		align-items: center;
		display: flex;
		gap: 0.25rem;
		min-width: 0;
	}

	.app-name {
		color: #1f2328;
		font-size: 1rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.actions {
		align-items: center;
		display: flex;
		gap: 0.5rem;
	}

	.clear-button {
		align-items: center;
		background: #fff;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		color: #4b5563;
		cursor: pointer;
		display: inline-flex;
		font-size: 0.875rem;
		font-weight: 600;
		gap: 0.25rem;
		padding: 0.45rem 0.75rem;
		transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
	}

	.clear-button:hover {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}

	.clear-button:focus-visible {
		outline: 2px solid #dc2626;
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.app-header {
			align-items: flex-start;
			flex-direction: column;
			padding: 0.5rem 0.75rem;
		}

		.app-name {
			font-size: 0.9rem;
		}

		.actions {
			width: 100%;
			justify-content: flex-end;
		}
	}
</style>
