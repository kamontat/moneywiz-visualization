import type { DataRecord, Queriable } from '$lib/types/index.js'

export type Querier<DB extends Queriable, R> = (db: DB) => Promise<R>
export type Classifier<R, D extends DataRecord> = (raw: R[]) => D
