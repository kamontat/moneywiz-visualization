<script lang="ts">
	interface Props {
		start: Date;
		end: Date;
	}

	let { start, end }: Props = $props();

	function formatDate(d: Date): string {
		return d.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<span class="text-xs font-medium text-mw-text-secondary whitespace-nowrap">
	{formatDate(start)} <span class="text-mw-text-muted/50 mx-1">—</span> {formatDate(end)}
</span>
