<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import CsvUploadButton from '../molecules/CsvUploadButton.svelte';
	import MoneyLogo from '../atoms/MoneyLogo.svelte';
	import TrashIcon from '@iconify-svelte/lucide/trash-2';

	interface Props {
		onparsed?: (detail: { file: File; data: ParsedCsv }) => void;
		onerror?: (detail: { file: File | null; message: string }) => void;
		onclear?: () => void;
		csvLoaded?: boolean;
	}

	let { onparsed, onerror, onclear, csvLoaded = false }: Props = $props();
</script>

<header class="sticky top-0 z-50 flex flex-row items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2 bg-white/70 dark:bg-mw-surface-alt/80 backdrop-blur-md border-b border-mw-border/50">
	<div class="inline-flex items-center gap-2 min-w-0">
		<MoneyLogo size={32} />
		<div class="flex items-center gap-1 min-w-0">
			<span class="text-mw-text-main text-base sm:text-lg font-bold tracking-tight uppercase whitespace-nowrap">MoneyWiz Report</span>
		</div>
	</div>

	<div class="flex items-center justify-end gap-2">
		{#if csvLoaded}
			<button class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200/50 rounded-full cursor-pointer transition-all duration-150 ease-in-out hover:bg-red-100 hover:border-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2" type="button" onclick={onclear} aria-label="Clear loaded CSV">
				<TrashIcon class="w-4 h-4" aria-hidden="true" />
				<span class="hidden sm:inline">Clear</span>
			</button>
		{/if}
		<CsvUploadButton {onparsed} {onerror} />
	</div>
</header>
