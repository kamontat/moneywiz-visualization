export const readFileInChunks = async (
	file: File,
	chunkSize: number,
	onChunk: (chunk: Uint8Array) => Promise<void>
): Promise<void> => {
	if (chunkSize <= 0) {
		throw new Error('chunkSize must be greater than 0')
	}

	let offset = 0
	while (offset < file.size) {
		const end = Math.min(file.size, offset + chunkSize)
		const chunk = await file.slice(offset, end).arrayBuffer()
		await onChunk(new Uint8Array(chunk))
		offset = end
	}
}
