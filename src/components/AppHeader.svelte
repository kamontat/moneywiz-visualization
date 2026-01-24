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

<header class="sticky top-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2 bg-mw-surface-alt border-b border-mw-border">
	<div class="inline-flex items-center gap-2 min-w-0">
		<MoneyLogo size={28} />
		<div class="flex items-center gap-1 min-w-0">
			<span class="text-mw-text-main text-sm sm:text-base font-extrabold tracking-wide uppercase whitespace-nowrap">MoneyWiz Visualization</span>
		</div>
	</div>

	<div class="flex w-full sm:w-auto items-center justify-end gap-2">
		{#if csvLoaded}
			<button class="inline-flex items-center gap-1 px-3 py-[0.45rem] text-sm font-semibold text-mw-text-secondary bg-white border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:bg-red-50 hover:border-red-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2" type="button" onclick={onclear} aria-label="Clear loaded CSV">
				Clear
			</button>
		{/if}
		<CsvUploadButton {onparsed} {onerror} />
	</div>
</header>
