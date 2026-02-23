export type SQLiteWorkerAction =
	| 'upload'
	| 'bootstrap'
	| 'rebuild_snapshot'
	| 'clear'
	| 'status'

export type SQLiteWorkerRequest =
	| {
			id: string
			action: 'upload'
			payload: { file: File }
	  }
	| {
			id: string
			action: 'bootstrap'
	  }
	| {
			id: string
			action: 'rebuild_snapshot'
	  }
	| {
			id: string
			action: 'clear'
	  }
	| {
			id: string
			action: 'status'
	  }
