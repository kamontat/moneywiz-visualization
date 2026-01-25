<script lang="ts">
	interface Props {
		start: Date;
		end: Date;
	}

	let { start, end }: Props = $props();

	function formatDate(d: Date): string {
		return d.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="flex flex-col items-start gap-0.5">
	<span class="text-[10px] font-bold text-mw-text-muted/70 uppercase tracking-widest">Date Range</span>
	<span class="text-xs font-medium text-mw-text-secondary whitespace-nowrap">
		{formatDate(start)} <span class="text-mw-text-muted/50 mx-1">—</span> {formatDate(end)}
	</span>
</div>
