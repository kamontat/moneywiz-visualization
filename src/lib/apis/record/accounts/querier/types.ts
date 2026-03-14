/** Raw account row from SQLite */
export interface RawAccount {
	readonly id: number
	readonly name: string
	readonly entityType: number
	readonly currency: string | null
}
