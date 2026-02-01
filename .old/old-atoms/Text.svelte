<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/models/props'

	type Props = BaseProps &
		ElementProps<'p' | 'span' | 'div' | 'label'> & {
			variant?: 'body' | 'muted' | 'small' | 'error'
		}

	let { tag = 'p', variant = 'body', children, class: className = '', ...rest }: Props = $props()

	const baseClass: string[] = []
	const variantClass = {
		body: ['text-mw-text-main'],
		muted: ['text-mw-text-muted'],
		small: ['text-xs', 'text-secondary'],
		error: ['text-red-500', 'text-sm'],
	}
</script>

<svelte:element
	this={tag}
	class={[...baseClass, ...(variantClass[variant] ?? []), className].flat()}
	{...rest}
>
	{@render children?.()}
</svelte:element>
