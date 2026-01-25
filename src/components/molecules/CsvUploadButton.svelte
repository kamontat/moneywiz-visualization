<script lang="ts">
	import { parseCsvFile, type ParsedCsv } from '$lib/csv';
	import { log } from '$lib/debug';
	import UploadIcon from '@iconify-svelte/lucide/upload';

	interface Props {
		label?: string;
		id?: string;
		onparsed?: (detail: { file: File; data: ParsedCsv }) => void;
		onerror?: (detail: { file: File | null; message: string }) => void;
	}

	let { label = 'Upload CSV', id, onparsed, onerror }: Props = $props();
	const fallbackId = `csv-upload-${Math.random().toString(36).slice(2, 9)}`;
	const inputId = $derived(id ?? fallbackId);
	$effect(() => log.componentUpload('initialized with id=%s', inputId));

	let isParsing = $state(false);

	function openPicker() {
		log.componentUpload('opening file picker');
		const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
		fileInput?.click();
	}

	async function handleFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement | null;
		const file = target?.files?.[0];

		if (!file) {
			log.componentUpload('no file selected');
			return;
		}

		log.componentUpload('file selected: %s (%d bytes)', file.name, file.size);
		isParsing = true;

		try {
			const data = await parseCsvFile(file);
			log.componentUpload('parse successful, calling onparsed callback');
			onparsed?.({ file, data });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to parse CSV';
			log.componentUpload('parse error: %s', message);
			onerror?.({ file, message });
			console.error(message, error);
		} finally {
			if (target) {
				target.value = '';
			}
			isParsing = false;
			log.componentUpload('parsing complete, isParsing=%s', isParsing);
		}
	}
</script>

<div class="flex items-center">
	<input
		class="sr-only"
		accept=".csv,text/csv"
		onchange={handleFileChange}
		id={inputId}
		type="file"
	/>
	<button
		class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold text-white bg-gradient-to-br from-mw-primary to-mw-primary-dark border border-mw-primary rounded-full shadow-md shadow-emerald-600/20 cursor-pointer transition-all duration-150 ease-in-out hover:not-disabled:from-emerald-500 hover:not-disabled:to-emerald-600 hover:not-disabled:shadow-lg hover:not-disabled:shadow-emerald-600/30 hover:not-disabled:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-mw-primary focus-visible:outline-offset-2 disabled:from-teal-300 disabled:to-teal-400 disabled:border-teal-300 disabled:shadow-none disabled:cursor-not-allowed"
		type="button"
		onclick={openPicker}
		disabled={isParsing}
		aria-label={label}
	>
		{#if !isParsing}
			<UploadIcon class="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
		{/if}
		<span class={isParsing ? '' : 'hidden sm:inline'}>{isParsing ? 'Uploading…' : label}</span>
	</button>
</div>
