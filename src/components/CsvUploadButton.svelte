<script lang="ts">
	import { parseCsvFile, type ParsedCsv } from '$lib/csv';
	import { log } from '$lib/debug';

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

<div class="upload">
	<input
		class="visually-hidden"
		accept=".csv,text/csv"
		onchange={handleFileChange}
		id={inputId}
		type="file"
	/>
	<button class="upload-button" type="button" onclick={openPicker} disabled={isParsing}>
		{isParsing ? 'Uploading…' : label}
	</button>
</div>

<style>
	.upload {
		display: flex;
		align-items: center;
	}

	.visually-hidden {
		border: 0;
		clip: rect(0 0 0 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	.upload-button {
		align-items: center;
		background: linear-gradient(135deg, #0f9d58, #2e8f62);
		border: 1px solid #0f9d58;
		border-radius: 8px;
		box-shadow: 0 6px 16px rgba(15, 157, 88, 0.18);
		color: #f7fbf9;
		cursor: pointer;
		display: inline-flex;
		font-size: 0.875rem;
		font-weight: 700;
		gap: 0.25rem;
		letter-spacing: 0.01em;
		padding: 0.45rem 0.85rem;
		transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
	}

	.upload-button:hover:not(:disabled) {
		background: linear-gradient(135deg, #10a164, #35a869);
		box-shadow: 0 10px 22px rgba(15, 157, 88, 0.24);
		transform: translateY(-1px);
	}

	.upload-button:focus-visible {
		outline: 2px solid #0f9d58;
		outline-offset: 2px;
	}

	.upload-button:disabled {
		background: linear-gradient(135deg, #9fb7a7, #a9c0b0);
		border-color: #9fb7a7;
		box-shadow: none;
		cursor: not-allowed;
	}
</style>
