export interface ChartThemeColors {
	success: string
	error: string
	info: string
	primary: string
	secondary: string
	warning: string
	neutral: string
	baseContent: string
	baseContentMuted: string
}

const FALLBACK_COLORS: ChartThemeColors = {
	success: '#22c55e',
	error: '#ef4444',
	info: '#3b82f6',
	primary: '#6366f1',
	secondary: '#a855f7',
	warning: '#f59e0b',
	neutral: '#6b7280',
	baseContent: '#1f2937',
	baseContentMuted: '#1f293780',
}

export const getThemeColors = (): ChartThemeColors => {
	if (typeof document === 'undefined') return FALLBACK_COLORS

	const style = getComputedStyle(document.documentElement)

	const resolve = (varName: string, fallback: string): string => {
		const value = style.getPropertyValue(varName).trim()
		return value || fallback
	}

	return {
		success: resolve('--color-success', FALLBACK_COLORS.success),
		error: resolve('--color-error', FALLBACK_COLORS.error),
		info: resolve('--color-info', FALLBACK_COLORS.info),
		primary: resolve('--color-primary', FALLBACK_COLORS.primary),
		secondary: resolve('--color-secondary', FALLBACK_COLORS.secondary),
		warning: resolve('--color-warning', FALLBACK_COLORS.warning),
		neutral: resolve('--color-neutral', FALLBACK_COLORS.neutral),
		baseContent: resolve('--color-base-content', FALLBACK_COLORS.baseContent),
		baseContentMuted: resolve(
			'--color-base-content',
			FALLBACK_COLORS.baseContentMuted
		),
	}
}

const CATEGORY_PALETTE = [
	'#6366f1', // indigo
	'#f59e0b', // amber
	'#10b981', // emerald
	'#ef4444', // red
	'#8b5cf6', // violet
	'#06b6d4', // cyan
	'#f97316', // orange
	'#ec4899', // pink
	'#14b8a6', // teal
	'#84cc16', // lime
	'#a855f7', // purple
	'#eab308', // yellow
]

export const getCategoryPalette = (count: number): string[] => {
	return Array.from(
		{ length: count },
		(_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]
	)
}
