declare module 'sql.js/dist/sql-wasm.js' {
	export interface SqlJsConfig {
		locateFile?: (file: string) => string
	}

	export interface SqlStatement {
		step(): boolean
		getAsObject(params?: unknown[] | Record<string, unknown>): unknown
		free(): void
	}

	export interface SqlDatabase {
		prepare(sql: string, params?: unknown[]): SqlStatement
		close(): void
	}

	export interface SqlJsStatic {
		Database: new (data?: Uint8Array) => SqlDatabase
	}

	const initSqlJs: (config?: SqlJsConfig) => Promise<SqlJsStatic>
	export default initSqlJs
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
	const wasmUrl: string
	export default wasmUrl
}
