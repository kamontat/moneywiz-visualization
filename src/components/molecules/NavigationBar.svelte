<script lang="ts">
    interface Props {
        children: import('svelte').Snippet;
        label?: string;
    }
    let { children, label = "Dashboard views" }: Props = $props();
</script>

<nav class="flex border-b border-mw-border mt-4" aria-label={label}>
    {@render children()}
</nav>
