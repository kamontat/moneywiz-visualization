<script lang="ts">
	interface Props {
		start: Date;
		end: Date;
		class?: string;
	}

	let { start, end, class: className = 'text-xs text-mw-text-secondary' }: Props = $props();

	function formatDate(d: Date): string {
		return d.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<span class="font-medium whitespace-nowrap {className}">
	{formatDate(start)} <span class="mx-1 opacity-50">—</span>
	{formatDate(end)}
</span>
