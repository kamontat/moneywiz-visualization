<script lang="ts">
	import type { CategoryTree } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down'
	import { SvelteSet } from 'svelte/reactivity'

	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			categoryTree: CategoryTree
		}>

	let { categoryTree, class: className, ...rest }: Props = $props()

	const expandedParents = new SvelteSet<string>()

	const toggleParent = (name: string) => {
		if (expandedParents.has(name)) {
			expandedParents.delete(name)
		} else {
			expandedParents.add(name)
		}
	}

	const formatAmount = (value: number): string => formatCurrency(value)
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-1'], className)} {...rest}>
	{#if categoryTree.parents.length === 0}
		<p class="py-8 text-center text-sm text-base-content/60">
			No categories found
		</p>
	{:else}
		<div class="mb-2 text-sm text-base-content/60">
			Total: <span class="font-semibold text-base-content"
				>{formatAmount(categoryTree.total)}</span
			>
		</div>

		{#each categoryTree.parents as parent (parent.name)}
			{@const isExpanded = expandedParents.has(parent.name)}
			<div class="overflow-hidden rounded-box bg-base-200/50">
				<button
					class="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-base-200"
					onclick={() => toggleParent(parent.name)}
				>
					<div class="flex items-center gap-2">
						<ChevronDownIcon
							class="h-4 w-4 transition-transform {isExpanded
								? ''
								: '-rotate-90'}"
						/>
						<span class="font-medium">{parent.name}</span>
					</div>
					<div class="flex items-center gap-3 text-sm">
						<span class="font-semibold">{formatAmount(parent.total)}</span>
						<span class="d-badge d-badge-ghost text-xs d-badge-sm">
							{parent.percentage.toFixed(1)}%
						</span>
					</div>
				</button>

				{#if isExpanded}
					<div class="flex flex-col gap-1 px-3 pb-3">
						{#each parent.children as child (child.name)}
							<div
								class="flex items-center justify-between rounded-lg bg-base-100 px-3 py-2 text-sm"
							>
								<span class="text-base-content/80">{child.name}</span>
								<div class="flex items-center gap-3">
									<span class="font-medium">{formatAmount(child.total)}</span>
									<span class="text-xs text-base-content/50"
										>{child.percentage.toFixed(1)}%</span
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>
