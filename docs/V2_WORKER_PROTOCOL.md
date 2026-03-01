# Worker Protocol V2

## Request Schema

```ts
type SQLiteWorkerRequest =
	| { id: string; action: 'upload'; payload: { file: File } }
	| { id: string; action: 'bootstrap' }
	| { id: string; action: 'rebuild_snapshot' }
	| { id: string; action: 'clear' }
	| { id: string; action: 'status' }
```

## Progress Response

```ts
{
	id: string
	action: 'upload' | 'bootstrap' | 'rebuild_snapshot'
	status: 'progress'
	progress: {
		phase: string
		processed: number
		total?: number
		percentage?: number
		error?: string
	}
}
```

## Success Responses

- `upload` -> `{ backend, sourceAvailable, source, transactionCount }`
- `bootstrap`/`rebuild_snapshot` ->
  `{ ready, rebuilt, backend?, sourceAvailable, transactionCount, reason?, source? }`
- `clear` -> `{ cleared: true }`
- `status` -> `{ backend?, sourceAvailable, snapshotValid, transactionCount, source? }`

## Error Response

```ts
{
	id: string
	action: 'upload' | 'bootstrap' | 'rebuild_snapshot' | 'clear' | 'status'
	status: 'error'
	error: string
}
```

## Notes

- Progress messages may be emitted multiple times per request.
- Each non-progress request returns a single terminal `ok` or `error` response.
- Request IDs are client-generated and used for pending map resolution.
