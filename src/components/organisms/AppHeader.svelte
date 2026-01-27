<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import Header from '$components/molecules/Header.svelte';
	import PageTitle from '$components/organisms/PageTitle.svelte';
	import UploadCsv from '$components/molecules/UploadCsv.svelte';
	import ClearCsv from '$components/molecules/ClearCsv.svelte';
	import GithubIcon from '@iconify-svelte/lucide/github';

	interface Props {
		onparsed?: (detail: { file: File; data: ParsedCsv }) => void;
		onerror?: (detail: { file: File | null; message: string }) => void;
		onclear?: () => void;
		csvLoaded?: boolean;
	}

	let { onparsed, onerror, onclear, csvLoaded = false }: Props = $props();
</script>

<Header>
	<PageTitle title="MoneyWiz Report" />

	<div class="flex items-center justify-end gap-2">
		<a
			href="https://github.com/kamontat/moneywiz-visualization"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center justify-center rounded-full p-2 text-mw-text-muted transition-colors hover:bg-mw-surface-alt hover:text-mw-text-main"
			aria-label="GitHub Repository"
		>
			<GithubIcon class="h-5 w-5" />
		</a>
		{#if csvLoaded}
			<ClearCsv {onclear} />
		{/if}
		<UploadCsv {onparsed} {onerror} />
	</div>
</Header>
