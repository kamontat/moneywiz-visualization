export interface CategoryTreeChild {
	name: string
	total: number
	percentage: number
}

export interface CategoryTreeParent {
	name: string
	total: number
	percentage: number
	children: CategoryTreeChild[]
}

export interface CategoryTree {
	total: number
	parents: CategoryTreeParent[]
}
