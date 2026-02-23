export const flushBatch = async <T>(
	batch: T[],
	callback: (items: T[]) => Promise<void>
): Promise<void> => {
	if (batch.length === 0) return
	const pending = [...batch]
	batch.length = 0
	await callback(pending)
}
