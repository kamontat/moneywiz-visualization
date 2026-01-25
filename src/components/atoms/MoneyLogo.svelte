<script lang="ts">
	const props = $props();
	let { size = 40 }: { size?: number } = props;
</script>

<div class="inline-flex items-center justify-center bg-gradient-to-br from-mw-primary to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 text-white font-extrabold tracking-wide" style="width:{size}px;height:{size}px" aria-hidden="true">
	<span class="text-lg leading-none">$</span>
</div>
