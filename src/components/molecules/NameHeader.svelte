<script lang="ts">
	import Link from '$components/atoms/Link.svelte'
</script>

<Link href="/" aria-label="Go to homepage" class="flex items-center gap-2">
	<div
		class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content"
	>
		<span class="text-lg font-bold">M</span>
	</div>
	<span
		class="hidden text-lg font-semibold tracking-tight text-base-content sm:inline"
	>
		MoneyWiz Report
	</span>
</Link>
