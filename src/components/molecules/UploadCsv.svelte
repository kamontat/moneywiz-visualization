<script lang="ts">
    import { parseCsvFile, type ParsedCsv } from '$lib/csv';
    import { log } from '$lib/debug';
    import Button from '$components/atoms/Button.svelte';
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
    <Button
        variant="primary"
        disabled={isParsing}
        onclick={openPicker}
        {label}
    >
        {#if !isParsing}
            <UploadIcon class="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
        {/if}
        <span class={isParsing ? '' : 'hidden sm:inline'}>{isParsing ? 'Uploading…' : label}</span>
    </Button>
</div>
