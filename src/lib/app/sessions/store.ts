import type {
	SessionState,
	FilterState,
	FilterOptions,
	Analytics,
	BootstrapProgress,
	UploadProgress,
} from './types'
import { writable, derived, type Readable, type Writable } from 'svelte/store'

// --- Session Store ---

export interface SessionStore extends Readable<SessionState> {
	set: (state: SessionState) => void
	patch: (partial: Partial<SessionState>) => void
	reset: () => void
}

const INITIAL_SESSION: SessionState = {
	status: 'idle',
	transactionCount: 0,
}

export function createSessionStore(): SessionStore {
	const { subscribe, set, update } = writable<SessionState>(INITIAL_SESSION)

	return {
		subscribe,
		set(state: SessionState) {
			set(state)
		},
		patch(partial: Partial<SessionState>) {
			update((current) => ({ ...current, ...partial }))
		},
		reset() {
			set(INITIAL_SESSION)
		},
	}
}

// --- Filter Store ---

const INITIAL_FILTER: FilterState = {
	transactionTypes: [],
	transactionTypeMode: 'include',
	categories: [],
	categoryMode: 'include',
	payees: [],
	accounts: [],
	tags: [],
}

export function createFilterStore(): Writable<FilterState> {
	return writable<FilterState>(INITIAL_FILTER)
}

// --- Filter Options Store ---

const INITIAL_OPTIONS: FilterOptions = {
	categories: [],
	payees: [],
	accounts: [],
	transactionTypes: [],
	tags: [],
}

export function createFilterOptionsStore(): Writable<FilterOptions> {
	return writable<FilterOptions>(INITIAL_OPTIONS)
}

// --- Analytics Store ---

const INITIAL_ANALYTICS: Analytics = {
	income: 0,
	expense: 0,
	net: 0,
	savingsRate: 0,
	transactionCount: 0,
}

export function createAnalyticsStore(): Writable<Analytics> {
	return writable<Analytics>(INITIAL_ANALYTICS)
}

// --- Progress Store ---

export function createBootstrapProgressStore(): Writable<BootstrapProgress | null> {
	return writable<BootstrapProgress | null>(null)
}

export function createUploadProgressStore(): Writable<UploadProgress | null> {
	return writable<UploadProgress | null>(null)
}

// --- Derived helpers ---

export function deriveStatus(
	session: Readable<SessionState>
): Readable<SessionState['status']> {
	return derived(session, ($s) => $s.status)
}

export function deriveTransactionCount(
	session: Readable<SessionState>
): Readable<number> {
	return derived(session, ($s) => $s.transactionCount)
}

export function deriveHasData(
	session: Readable<SessionState>
): Readable<boolean> {
	return derived(
		session,
		($s) => $s.status === 'ready' && $s.transactionCount > 0
	)
}
