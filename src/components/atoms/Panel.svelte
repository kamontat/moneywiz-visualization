<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import CircleHelpIcon from '@iconify-svelte/lucide/circle-help'

	import { mergeClass, newTwClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			title?: string
			question?: string
		}>

	let { title, question, children, class: className, ...rest }: Props = $props()

	const baseClass = newTwClass([
		'rounded-box',
		'bg-base-200/50',
		'p-4',
		'sm:p-6',
	])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	{#if title}
		<div class="mb-4 flex items-center gap-2">
			<h3 class="text-lg font-semibold text-base-content">{title}</h3>
			{#if question}
				<button
					type="button"
					class="mw-tooltip d-tooltip d-tooltip-right cursor-help border-0
						bg-transparent
						p-0 text-base-content/50 hover:text-base-content/70"
					data-tip={question}
					aria-label={`About ${title}`}
				>
					<CircleHelpIcon class="size-4" />
				</button>
			{/if}
		</div>
	{/if}
	{@render children?.()}
</div>
