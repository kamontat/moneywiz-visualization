<script lang="ts">
    interface Props {
        children: import('svelte').Snippet;
        class?: string;
        'aria-labelledby'?: string;
        'aria-label'?: string;
        tag?: string;
    }
    let {
        children,
        class: className = '',
        'aria-labelledby': ariaLabelledBy,
        'aria-label': ariaLabel,
        tag = 'section'
    }: Props = $props();

    const baseClass = "bg-mw-surface border border-mw-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow";
</script>

<svelte:element
    this={tag}
    class="{baseClass} {className}"
    aria-labelledby={ariaLabelledBy}
    aria-label={ariaLabel}
>
    {@render children()}
</svelte:element>
