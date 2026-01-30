<script lang="ts">
	import Panel from '$components/atoms/Panel.svelte'

	interface Props {
		children: import('svelte').Snippet
		class?: string
		'aria-labelledby'?: string
		'aria-label'?: string
		tag?: 'div' | 'section' | 'article' | 'aside'
	}
	let {
		children,
		class: className = '',
		'aria-labelledby': ariaLabelledBy,
		'aria-label': ariaLabel,
		tag = 'section',
	}: Props = $props()
</script>

<Panel
	{tag}
	class="hover:shadow-md {className}"
	aria-labelledby={ariaLabelledBy}
	aria-label={ariaLabel}
>
	{@render children()}
</Panel>
