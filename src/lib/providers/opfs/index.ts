import type { Versionable } from '$lib/types/index.js'

export class OpfsProvider implements Versionable<'opfs', 1> {
	readonly name = 'opfs' as const
	readonly version = 1 as const

	constructor(private readonly root: Promise<FileSystemDirectoryHandle>) {}

	async has(filename: string): Promise<boolean> {
		try {
			const dir = await this.root
			await dir.getFileHandle(filename)
			return true
		} catch {
			return false
		}
	}

	async read(filename: string): Promise<File | undefined> {
		try {
			const dir = await this.root
			const handle = await dir.getFileHandle(filename)
			return await handle.getFile()
		} catch {
			return undefined
		}
	}

	async write(
		filename: string,
		data: File | Blob | ArrayBuffer
	): Promise<void> {
		const dir = await this.root
		const handle = await dir.getFileHandle(filename, { create: true })
		const writable = await handle.createWritable()
		await writable.write(data)
		await writable.close()
	}

	async delete(filename: string): Promise<void> {
		try {
			const dir = await this.root
			await dir.removeEntry(filename)
		} catch {
			// File doesn't exist, nothing to delete
		}
	}

	async clear(): Promise<void> {
		const dir = await this.root
		for await (const [name] of dir as unknown as AsyncIterable<
			[string, FileSystemHandle]
		>) {
			await dir.removeEntry(name)
		}
	}

	async files(): Promise<string[]> {
		const dir = await this.root
		const names: string[] = []
		for await (const [name] of dir as unknown as AsyncIterable<
			[string, FileSystemHandle]
		>) {
			names.push(name)
		}
		return names
	}
}

function setupOpfsProvider(): OpfsProvider {
	const root = navigator.storage.getDirectory()
	return new OpfsProvider(root)
}

export const opfs = /* @__PURE__ */ setupOpfsProvider()
