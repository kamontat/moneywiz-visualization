<script lang="ts">
	import DataPreviewPanel from './DataPreviewPanel.svelte';
	import type { ParsedCsv } from '$lib/csv';

	interface Props {
		data: ParsedCsv | null;
	}
	let { data }: Props = $props();
</script>

<div class="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-4 pt-4 duration-300">
	<DataPreviewPanel {data} />
</div>
