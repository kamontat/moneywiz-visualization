import type { FilterState } from './models'
import { analytic } from '$lib/loggers'

const DATE_FILTER_STORAGE_KEY = 'moneywiz:filters:date-range:v1'
const log = analytic.extends('dateRangePersistence')

type PersistedDateRange = {
	start?: number
	end?: number
}

export const getDefaultDateRange = (): { start: Date; end: Date } => {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	return {
		start: new Date(year, month - 24, 1, 0, 0, 0, 0),
		end: new Date(year, month, 0, 23, 59, 59, 999),
	}
}

export const loadPersistedDateRange = ():
	| FilterState['dateRange']
	| undefined => {
	if (typeof window === 'undefined') return undefined
	try {
		const raw = window.localStorage.getItem(DATE_FILTER_STORAGE_KEY)
		if (!raw) return undefined
		const parsed = JSON.parse(raw) as PersistedDateRange
		return {
			start:
				typeof parsed.start === 'number' ? new Date(parsed.start) : undefined,
			end: typeof parsed.end === 'number' ? new Date(parsed.end) : undefined,
		}
	} catch (error) {
		log.warn('failed to load persisted date range', { error })
		return undefined
	}
}

export const persistDateRange = (dateRange: FilterState['dateRange']): void => {
	if (typeof window === 'undefined') return
	try {
		if (!dateRange.start && !dateRange.end) {
			window.localStorage.removeItem(DATE_FILTER_STORAGE_KEY)
			return
		}

		const value: PersistedDateRange = {
			start: dateRange.start?.getTime(),
			end: dateRange.end?.getTime(),
		}
		window.localStorage.setItem(DATE_FILTER_STORAGE_KEY, JSON.stringify(value))
	} catch (error) {
		log.warn('failed to persist date range', { error })
	}
}
