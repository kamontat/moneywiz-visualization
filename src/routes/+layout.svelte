<script lang="ts">
	import AppHeader from '../components/AppHeader.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<AppHeader />
	<main class="page-shell">{@render children()}</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.page-shell {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	@media (max-width: 640px) {
		.page-shell {
			padding: 1.25rem 1rem;
		}
	}
</style>
