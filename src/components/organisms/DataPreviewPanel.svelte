<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import ChevronUpIcon from '@iconify-svelte/lucide/chevron-up';

	interface Props {
		data: ParsedCsv | null;
	}

	let { data }: Props = $props();

	let isOpen = $state(false);
	const maxPreviewRows = 5;

	// Only show panel if we have data structure, even if rows are empty (to show "no rows" message)
	const hasStructure = $derived(!!data);
</script>

{#if hasStructure}
	<div
		class="bg-mw-surface border border-mw-border rounded-xl overflow-hidden shadow-sm ring-mw-primary/5 focus-within:ring-2 focus-within:ring-offset-1 transition-shadow"
	>
		<button
			type="button"
			class="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer select-none outline-none border-b border-mw-border/50"
			onclick={() => (isOpen = !isOpen)}
			aria-expanded={isOpen}
			aria-controls="preview-content"
		>
			<span class="text-sm font-semibold text-mw-text-main">Data Preview</span>
			<div class="flex items-center gap-1 text-xs font-medium text-mw-text-muted">
				{#if isOpen}
					Hide Table <ChevronUpIcon class="w-3.5 h-3.5" />
				{:else}
					Show Table <ChevronDownIcon class="w-3.5 h-3.5" />
				{/if}
			</div>
		</button>

		{#if isOpen}
			<div
				id="preview-content"
				class="flex flex-col gap-2 p-4 animate-in slide-in-from-top-1 duration-200"
			>
				{#if (data?.rows?.length ?? 0) > 0}
					<div class="overflow-x-auto border border-mw-border rounded-lg">
						<table class="border-collapse" style="table-layout: auto; min-width: 100%;">
							<thead class="bg-gray-50">
								<tr class="border-b border-mw-border">
									{#each (data?.headers ?? []) as header}
										<th
											scope="col"
											class="px-3 py-2 text-left text-sm font-bold text-mw-text-main whitespace-nowrap"
											>{header}</th
										>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each (data?.rows ?? []).slice(0, maxPreviewRows) as row}
									<tr class="border-b border-mw-border last:border-0">
										{#each (data?.headers ?? []) as header}
											<td
												class="px-3 py-2 text-left text-sm text-mw-text-secondary overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
												>{row[header]}</td
											>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if (data?.rows?.length ?? 0) > maxPreviewRows}
						<div class="text-xs text-mw-text-muted text-center pt-1">
							Showing first {maxPreviewRows} rows of {data?.rows.length}
						</div>
					{/if}
				{:else}
					<p
						class="m-0 p-4 border border-dashed border-amber-500 rounded-lg bg-amber-50 text-amber-800 text-sm"
					>
						No data rows found in this file.
					</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}
