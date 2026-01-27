<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
		class?: string;
		'aria-labelledby'?: string;
	}
	let { children, class: className = '', 'aria-labelledby': ariaLabelledBy }: Props = $props();
</script>

<section aria-labelledby={ariaLabelledBy} class="flex flex-col gap-4 {className}">
	{@render children()}
</section>
