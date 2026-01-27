<script lang="ts">
	const props = $props();
	let { size = 40 }: { size?: number } = props;
</script>

<div
	class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-mw-primary to-mw-secondary font-extrabold tracking-wide text-white shadow-lg shadow-mw-primary/20"
	style="width:{size}px;height:{size}px"
	aria-hidden="true"
>
	<span class="text-lg leading-none">$</span>
</div>
