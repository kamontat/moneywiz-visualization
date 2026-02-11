import type {
	SQLiteOverview,
	SQLitePageRequest,
	SQLiteParseProgress,
	SQLiteSectionPage,
} from './sqlite'

export interface SQLiteWorkerOpenPayload {
	fileName: string
	fileSizeBytes: number
	buffer: ArrayBuffer
}

export type SQLiteWorkerRequest =
	| {
			id: string
			action: 'open'
			payload: SQLiteWorkerOpenPayload
	  }
	| {
			id: string
			action: 'getPage'
			payload: SQLitePageRequest
	  }
	| {
			id: string
			action: 'close'
	  }

export type SQLiteWorkerResponse =
	| {
			id: string
			action: 'open'
			status: 'progress'
			progress: SQLiteParseProgress
	  }
	| {
			id: string
			action: 'open'
			status: 'ok'
			data: SQLiteOverview
	  }
	| {
			id: string
			action: 'getPage'
			status: 'ok'
			data: SQLiteSectionPage
	  }
	| {
			id: string
			action: 'close'
			status: 'ok'
			data: { closed: true }
	  }
	| {
			id: string
			action: 'open' | 'getPage' | 'close'
			status: 'error'
			error: string
	  }
