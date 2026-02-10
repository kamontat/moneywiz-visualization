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

const colorAlphaCache = new Map<string, string>()

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

const toRgbColor = (color: string, fallback: string): string => {
	if (typeof document === 'undefined') return fallback

	const el = document.createElement('span')
	el.style.color = fallback
	el.style.color = color
	el.style.display = 'none'
	document.body.appendChild(el)
	const resolved = getComputedStyle(el).color || fallback
	document.body.removeChild(el)
	return resolved
}

export const withAlpha = (
	color: string,
	alpha: number,
	fallback = '#000000'
): string => {
	const safeAlpha = Math.max(0, Math.min(1, alpha))
	const cacheKey = `${color}:${safeAlpha}:${fallback}`
	const cached = colorAlphaCache.get(cacheKey)
	if (cached) return cached

	const rgb = toRgbColor(color, fallback)
	const match = rgb.match(
		/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/
	)

	if (!match) {
		colorAlphaCache.set(cacheKey, fallback)
		return fallback
	}

	const result = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${safeAlpha})`
	colorAlphaCache.set(cacheKey, result)
	return result
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
