<script lang="ts">
	const props = $props();
	let { size = 40 }: { size?: number } = props;
</script>

<div class="logo" style={`width:${size}px;height:${size}px`} aria-hidden="true">
	<span class="symbol">$</span>
</div>

<style>
	.logo {
		align-items: center;
		background: linear-gradient(135deg, #0f9d58, #34a853);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(15, 157, 88, 0.18);
		color: #f7fbf9;
		display: inline-flex;
		font-weight: 800;
		justify-content: center;
		letter-spacing: 0.02em;
	}

	.symbol {
		font-size: 1.1rem;
		line-height: 1;
	}
</style>
