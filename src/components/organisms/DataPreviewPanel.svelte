<script lang="ts">
	import type { ParsedCsv } from '$lib/csv';

	interface Props {
		data: ParsedCsv | null;
	}

	let { data }: Props = $props();

	const maxPreviewRows = 5;

	// Only show panel if we have data structure, even if rows are empty (to show "no rows" message)
	const hasStructure = $derived(!!data);
</script>

{#if hasStructure}
	<div
		class="bg-mw-surface border border-mw-border rounded-xl overflow-hidden shadow-sm"
	>
		<div class="flex flex-col gap-2 p-4">
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
	</div>
{/if}
