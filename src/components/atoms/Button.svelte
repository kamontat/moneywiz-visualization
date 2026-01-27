<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'danger' | 'ghost' | 'tab' | 'icon';
		disabled?: boolean;
		label?: string;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		children?: import('svelte').Snippet;
		active?: boolean;
	}

	let {
		type = 'button',
		variant = 'primary',
		disabled = false,
		label,
		onclick,
		class: className = '',
		children,
		active = false
	}: Props = $props();

	const baseClass =
		'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-75 disabled:shadow-none disabled:cursor-not-allowed';

	const variants = {
		primary:
			'px-3.5 py-2 text-sm font-bold text-white bg-gradient-to-br from-mw-primary to-mw-primary-dark border border-mw-primary rounded-full shadow-md shadow-mw-primary/20 hover:not-disabled:from-mw-primary-dark hover:not-disabled:to-mw-primary-dark hover:not-disabled:shadow-lg hover:not-disabled:shadow-mw-primary/30 hover:not-disabled:-translate-y-px focus-visible:outline-mw-primary',
		danger:
			'px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200/50 rounded-full hover:bg-red-100 hover:border-red-300 focus-visible:outline-red-600',
		ghost:
			'p-2 text-mw-text-muted hover:text-mw-text-main hover:bg-mw-surface-alt rounded-full hover:bg-mw-surface-alt',
		tab: 'px-4 py-2 text-sm font-medium border-b-2 bg-transparent rounded-none focus-visible:outline-mw-primary text-mw-text-muted hover:text-mw-text-secondary hover:border-gray-300 border-transparent',
		icon: 'p-2 rounded-full hover:bg-black/5'
	};

	const activeTab = 'border-mw-primary text-mw-primary !text-mw-primary';
</script>

<button
	{type}
	class="{baseClass} {variants[variant]} {variant === 'tab' && active ? activeTab : ''} {className}"
	{disabled}
	{onclick}
	aria-label={label}
	aria-current={active && variant === 'tab' ? 'page' : undefined}
>
	{@render children?.()}
</button>
