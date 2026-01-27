<script lang="ts">
	import Button from '$components/atoms/Button.svelte';

	interface Props {
		label: string;
		active: boolean;
		onclick: () => void;
	}
	let { label, active, onclick }: Props = $props();
</script>

<Button variant="tab" {active} {onclick} {label}>
	{label}
</Button>
