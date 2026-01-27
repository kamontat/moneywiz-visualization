<script lang="ts">
    interface Props {
        title: string
    }
    let { title }: Props = $props();
</script>
<div class="inline-flex items-center gap-2 min-w-0">
    <a href="/" class="flex items-center gap-1 min-w-0 hover:opacity-80 transition-opacity decoration-0">
        <span class="text-mw-text-main text-base sm:text-lg font-bold tracking-tight uppercase whitespace-nowrap">
          {title}
        </span>
    </a>
</div>
