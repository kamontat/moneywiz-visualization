<script lang="ts">
    import DataPreviewPanel from './DataPreviewPanel.svelte';

    interface Props {
        data: any;
    }
    let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2 pt-4">
    <DataPreviewPanel {data} />
</div>
