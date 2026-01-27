<script lang="ts">
	interface Props {
		title: string;
	}
	let { title }: Props = $props();
</script>

<div class="inline-flex min-w-0 items-center gap-2">
	<a
		href="/"
		class="flex min-w-0 items-center gap-1 decoration-0 transition-opacity hover:opacity-80"
	>
		<span
			class="text-base font-bold tracking-tight whitespace-nowrap text-mw-text-main uppercase sm:text-lg"
		>
			{title}
		</span>
	</a>
</div>
