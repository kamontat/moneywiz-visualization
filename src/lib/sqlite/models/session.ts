import type {
	SQLiteParseProgress,
	SQLiteOverview,
	SQLitePageRequest,
	SQLiteSectionPage,
} from './sqlite'

export interface SQLiteSession {
	overview: SQLiteOverview
	getPage: (request: SQLitePageRequest) => Promise<SQLiteSectionPage>
	close: () => Promise<void>
}

export interface SQLiteSessionOptions {
	onProgress?: (progress: SQLiteParseProgress) => void
}
