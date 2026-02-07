export type CategoryTotalChildren = Record<string, number>

export interface CategoryTotalParent {
	total: number
	children: CategoryTotalChildren
}

export interface CategoryTotal {
	total: number
	parents: Record<string, CategoryTotalParent>
}
