<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { parseCsvFile, type ParsedCsv } from '$lib/csv';
	import { log } from '$lib/debug';

	let { label = 'Upload CSV', id }: { label?: string; id?: string } = $props();
	const inputId = id || `csv-upload-${Math.random().toString(36).slice(2, 9)}`;
	log.componentUpload('initialized with id=%s', inputId);

	const dispatch = createEventDispatcher<{
		parsed: { file: File; data: ParsedCsv };
		error: { file: File | null; message: string };
	}>();

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
			log.componentUpload('parse successful, dispatching parsed event');
			dispatch('parsed', { file, data });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to parse CSV';
			log.componentUpload('parse error: %s', message);
			dispatch('error', { file, message });
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
		on:change={handleFileChange}
		id={inputId}
		type="file"
	/>
		<button class="upload-button" type="button" on:click={openPicker} disabled={isParsing}>
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
		border-radius: 10px;
		box-shadow: 0 8px 20px rgba(15, 157, 88, 0.18);
		color: #f7fbf9;
		cursor: pointer;
		display: inline-flex;
		font-weight: 700;
		gap: 0.35rem;
		letter-spacing: 0.01em;
		padding: 0.65rem 1rem;
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
