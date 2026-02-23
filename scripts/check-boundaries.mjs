#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ROOT = 'src'
const ALLOWED_EXTENSIONS = new Set(['.ts', '.svelte'])

const isIgnored = (path) => {
	if (path.endsWith('.d.ts')) return true
	if (path.includes('/generated/')) return true
	if (path.includes('/__generated__/')) return true
	return false
}

const isAllowedImporter = (path) => {
	return path.startsWith('src/lib/') || path.startsWith('src/utils/')
}

const hasForbiddenUtilsImport = (content) => {
	const aliasImport = /from\s+['"]\$utils\//
	const absoluteImport = /from\s+['"][^'"]*src\/utils\//
	const relativeImport = /from\s+['"](?:\.\.\/)+utils\//
	return (
		aliasImport.test(content) ||
		absoluteImport.test(content) ||
		relativeImport.test(content)
	)
}

const walk = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true })
	const files = []

	for (const entry of entries) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...(await walk(path)))
			continue
		}
		files.push(path)
	}

	return files
}

const toWorkspacePath = (path) => {
	return relative(process.cwd(), path).replaceAll('\\\\', '/')
}

const run = async () => {
	const files = await walk(ROOT)
	const violations = []

	for (const fullPath of files) {
		const path = toWorkspacePath(fullPath)
		if (isIgnored(path)) continue
		if (!ALLOWED_EXTENSIONS.has(extname(path))) continue
		if (isAllowedImporter(path)) continue

		const content = await readFile(fullPath, 'utf8')
		if (hasForbiddenUtilsImport(content)) {
			violations.push(path)
		}
	}

	if (violations.length === 0) {
		console.log('Import boundary check passed')
		return
	}

	console.error(
		'Import boundary check failed: src/utils can only be imported from src/lib or src/utils'
	)
	for (const path of violations) {
		console.error(`- ${path}`)
	}
	process.exit(1)
}

await run()
