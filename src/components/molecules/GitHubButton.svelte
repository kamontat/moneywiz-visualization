<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/components/models'
	import GitHubIcon from '@iconify-svelte/lucide/github'

	import Icon from '$components/atoms/Icon.svelte'
	import { mergeClass } from '$lib/components'

	type Props = Omit<BaseProps, 'children'> & ElementProps<'a'>

	let { class: className, ...rest }: Props = $props()
	const tag = 'a'
	const href = 'https://github.com/kamontat/moneywiz-visualization'
	const label = 'Link to GitHub repository'
</script>

<Icon
	{tag}
	Component={GitHubIcon}
	class={mergeClass(['d-btn-accent'], className)}
	aria-label={label}
	{href}
	{...rest}
/>
