export function tokenize(line: string, delimiter = ','): string[] {
	const values: string[] = []
	let current = ''
	let inQuotes = false

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index]
		const next = line[index + 1]

		if (character === '"') {
			if (inQuotes && next === '"') {
				current += '"'
				index += 1
				continue
			}

			inQuotes = !inQuotes
			continue
		}

		if (character === delimiter && !inQuotes) {
			values.push(current.trim())
			current = ''
			continue
		}

		current += character
	}

	values.push(current.trim())
	return values
}
