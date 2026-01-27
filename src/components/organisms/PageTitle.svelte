<script lang="ts">
	import { base } from '$app/paths';

	interface Props {
		title: string;
	}
	let { title }: Props = $props();
</script>

<div class="inline-flex min-w-0 items-center gap-2">
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href="{base}/"
		class="flex min-w-0 items-center gap-1 decoration-0 transition-opacity hover:opacity-80"
	>
		<span
			class="text-base font-bold tracking-tight whitespace-nowrap text-mw-text-main uppercase sm:text-lg"
		>
			{title}
		</span>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>
