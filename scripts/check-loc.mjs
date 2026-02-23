#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const MAX_LOC = 300
const ROOTS = ['src/lib', 'src/utils']
const ALLOWED_EXTENSIONS = new Set(['.ts', '.svelte'])

const isTestFile = (path) => {
	return (
		path.endsWith('.spec.ts') ||
		path.endsWith('.test.ts') ||
		path.endsWith('.spec.svelte') ||
		path.endsWith('.test.svelte')
	)
}

const isExcluded = (path) => {
	if (path.endsWith('.d.ts')) return true
	if (path.includes('/generated/')) return true
	if (path.includes('/__generated__/')) return true
	if (isTestFile(path)) return true
	return false
}

const isLocExempt = (content) => {
	const header = content.split('\n').slice(0, 6).join('\n')
	return /LOC_EXEMPT:\s*(generated|protocol)/i.test(header)
}

const countLoc = (content) => {
	return content.split('\n').length
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
	const candidates = []
	for (const root of ROOTS) {
		candidates.push(...(await walk(root)))
	}

	const violations = []
	for (const fullPath of candidates) {
		const path = toWorkspacePath(fullPath)
		const extension = extname(path)
		if (!ALLOWED_EXTENSIONS.has(extension)) continue
		if (isExcluded(path)) continue

		const content = await readFile(fullPath, 'utf8')
		const lines = countLoc(content)
		if (lines <= MAX_LOC) continue
		if (isLocExempt(content)) continue

		violations.push({ path, lines })
	}

	if (violations.length === 0) {
		console.log(`LOC check passed (<= ${MAX_LOC} lines)`)
		return
	}

	console.error(
		`LOC check failed: ${violations.length} file(s) exceed ${MAX_LOC} lines`
	)
	for (const violation of violations) {
		console.error(`- ${violation.path}: ${violation.lines} lines`)
	}
	process.exit(1)
}

await run()
