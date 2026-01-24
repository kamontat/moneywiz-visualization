<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import CsvUploadButton from './CsvUploadButton.svelte';
	import MoneyLogo from './MoneyLogo.svelte';

	interface Props {
		onparsed?: (detail: { file: File; data: ParsedCsv }) => void;
		onerror?: (detail: { file: File | null; message: string }) => void;
	}

	let { onparsed, onerror }: Props = $props();
</script>

<header class="app-header">
	<div class="brand">
		<MoneyLogo />
		<div class="brand-text">
			<span class="app-name">MoneyWiz Visualization</span>
		</div>
	</div>

	<CsvUploadButton {onparsed} {onerror} />
</header>

<style>
	.app-header {
		align-items: center;
		background: #f7fbfd;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.brand {
		align-items: center;
		display: inline-flex;
		gap: 0.75rem;
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
		font-size: 1.15rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.app-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.app-name {
			font-size: 1.05rem;
		}
	}
</style>
