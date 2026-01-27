<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';

	interface Props {
		data: ParsedCsv | null;
	}

	let { data }: Props = $props();

	let maxPreviewRows = $state(5);
	const limitOptions = [5, 10, 20, 50, 100];

	// Only show panel if we have data structure, even if rows are empty (to show "no rows" message)
	const hasStructure = $derived(!!data);
</script>

{#if hasStructure}
	<div class="overflow-hidden rounded-xl border border-mw-border bg-mw-surface shadow-sm">
		<div class="flex flex-col gap-2 p-4">
			{#if (data?.rows?.length ?? 0) > 0}
				<div class="mb-1 flex items-center justify-end gap-2">
					<label for="row-limit-select" class="text-xs text-mw-text-muted">Show rows:</label>
					<div class="relative">
						<select
							id="row-limit-select"
							bind:value={maxPreviewRows}
							class="cursor-pointer appearance-none rounded border border-mw-border bg-white bg-none py-1 pr-6 pl-2 text-xs text-mw-text-main outline-none focus:border-mw-primary focus:ring-1 focus:ring-mw-primary"
						>
							{#each limitOptions as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-mw-text-muted"
						>
							<ChevronDownIcon class="h-3 w-3" />
						</div>
					</div>
				</div>
				<div class="overflow-x-auto rounded-lg border border-mw-border">
					<table class="border-collapse" style="table-layout: auto; min-width: 100%;">
						<thead class="bg-gray-50">
							<tr class="border-b border-mw-border">
								{#each data?.headers ?? [] as header}
									<th
										scope="col"
										class="px-3 py-2 text-left text-sm font-bold whitespace-nowrap text-mw-text-main"
										>{header}</th
									>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each (data?.rows ?? []).slice(0, maxPreviewRows) as row}
								<tr class="border-b border-mw-border last:border-0">
									{#each data?.headers ?? [] as header}
										<td
											class="max-w-[200px] overflow-hidden px-3 py-2 text-left text-sm text-ellipsis whitespace-nowrap text-mw-text-secondary"
											>{row[header]}</td
										>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if (data?.rows?.length ?? 0) > maxPreviewRows}
					<div class="pt-1 text-center text-xs text-mw-text-muted">
						Showing first {maxPreviewRows} rows of {data?.rows.length}
					</div>
				{/if}
			{:else}
				<p
					class="m-0 rounded-lg border border-dashed border-amber-500 bg-amber-50 p-4 text-sm text-amber-800"
				>
					No data rows found in this file.
				</p>
			{/if}
		</div>
	</div>
{/if}
