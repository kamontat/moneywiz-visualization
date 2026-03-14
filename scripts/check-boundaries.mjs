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

/** Legacy paths that have been fully deleted and must not be re-introduced. */
const DELETED_LEGACY_PATHS = [
	/from\s+['"]\$lib\/analytics['"/]/,
	/from\s+['"]\$lib\/session\/apis['"/]/,
	/from\s+['"]\$lib\/session\/state['"/]/,
	/from\s+['"]\$lib\/session\/store['"/]/,
	/from\s+['"]\$lib\/session\/index/,
	/from\s+['"]\$lib\/session['"]\s/,
]

const hasDeletedLegacyImport = (content) => {
	return DELETED_LEGACY_PATHS.some((pattern) => pattern.test(content))
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
	const utilsViolations = []
	const legacyViolations = []

	for (const fullPath of files) {
		const path = toWorkspacePath(fullPath)
		if (isIgnored(path)) continue
		if (!ALLOWED_EXTENSIONS.has(extname(path))) continue

		const content = await readFile(fullPath, 'utf8')

		if (!isAllowedImporter(path) && hasForbiddenUtilsImport(content)) {
			utilsViolations.push(path)
		}

		if (hasDeletedLegacyImport(content)) {
			legacyViolations.push(path)
		}
	}

	let failed = false

	if (utilsViolations.length > 0) {
		console.error(
			'Import boundary check failed: src/utils can only be imported from src/lib or src/utils'
		)
		for (const path of utilsViolations) {
			console.error(`- ${path}`)
		}
		failed = true
	}

	if (legacyViolations.length > 0) {
		console.error(
			'Import boundary check failed: imports from deleted legacy paths detected'
		)
		for (const path of legacyViolations) {
			console.error(`- ${path}`)
		}
		failed = true
	}

	if (failed) {
		process.exit(1)
	}

	console.log('Import boundary check passed')
}

await run()
