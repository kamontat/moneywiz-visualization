/**
 * Tag parsing and extraction logic
 */

/**
 * Parse tags from a single Tags field string.
 * Format: "Category: Value; Category2: Value2; "
 */
export function parseTagsFromField(tagsField: string): Record<string, string> {
	if (!tagsField) return {};

	const tags: Record<string, string> = {};
	const parts = tagsField
		.split(';')
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	for (const part of parts) {
		const [category, ...valueParts] = part.split(':');
		if (category && valueParts.length > 0) {
			const cat = category.trim();
			const val = valueParts.join(':').trim(); // Rejoin in case value contains colons
			if (cat && val) {
				tags[cat] = val;
			}
		}
	}

	return tags;
}

/**
 * Extract all unique tag categories and their values from the dataset.
 */
export function parseAllTags(rows: Record<string, string>[]): Map<string, Set<string>> {
	const allTags = new Map<string, Set<string>>();

	for (const row of rows) {
		const tagsStr = row['Tags'];
		if (!tagsStr) continue;

		const tags = parseTagsFromField(tagsStr);
		for (const [category, value] of Object.entries(tags)) {
			if (!allTags.has(category)) {
				allTags.set(category, new Set());
			}
			allTags.get(category)?.add(value);
		}
	}

	return allTags;
}
