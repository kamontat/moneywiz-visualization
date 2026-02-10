# src/components — UI Components

## OVERVIEW

Atomic Design structure: atoms (primitives) -> molecules (compositions)
-> organisms (page sections).

## STRUCTURE

```
components/
├── atoms/              # Primitives (Button, Input, Select, Icon, ChartCanvas, etc.)
├── molecules/          # Compositions (upload/filter/charts/table/header blocks)
│   └── models/         # Molecule-specific type models
├── organisms/          # Page-level assemblies (dashboard, panels, app shell)
└── AGENTS.md           # This guide
```

## WHERE TO LOOK

| Task                  | Location                   |
| --------------------- | -------------------------- |
| Add button/input/text | `atoms/`                   |
| Compose atoms         | `molecules/`               |
| Add page section      | `organisms/`               |
| Add analytics chart   | `molecules/*Chart.svelte`  |
| Update filter UI      | `organisms/FilterBar.svelte` + `molecules/FilterBar*.svelte` |
| Style utilities       | `$lib/components/class.ts` |
| Prop types            | `$lib/components/models/`  |

## CONVENTIONS

### Props Pattern (ALWAYS follow)

```svelte
<script lang="ts">
	import type {
		BaseProps,
		ElementProps,
		VariantProps,
	} from '$lib/components/models'
	import {
		mergeClass,
		newBaseClass,
		newVariantClass,
		newTwClass,
	} from '$lib/components'

	type Variant = 'plain' | 'primary' | 'secondary'
	type Props = BaseProps & VariantProps<Variant> & ElementProps<'button'>

	let {
		variant = 'primary',
		children,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newBaseClass(['d-btn'])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		primary: newTwClass(['d-btn-primary']),
		secondary: newTwClass(['d-btn-secondary']),
	})
</script>

<button
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	{...rest}
>
	{@render children?.()}
</button>
```

### Prop Types

| Type                  | Use When                                         |
| --------------------- | ------------------------------------------------ |
| `BaseProps`           | Always (provides `children`, `class`)            |
| `ElementProps<'tag'>` | Accepting native element props                   |
| `VariantProps<V>`     | Component has visual variants                    |
| `CustomProps<{...}>`  | Component-specific callbacks (onsuccess, onfail) |
| `ComponentProps<C>`   | Accepting dynamic component                      |

### Styling

- Use `newBaseClass` + `newVariantClass` + `mergeClass`
- DaisyUI classes prefixed `d-`
- `variant='plain'` returns empty base class
- Always accept `class` prop and merge it
- For chart components, render through `ChartCanvas.svelte`

### Children

- Accept via `children?: Children` in BaseProps
- Render via `{@render children?.()}`
- Omit from Props if component shouldn't have children

### Callbacks

- Use `CustomProps<{ onsuccess?: () => void }>` pattern
- Call directly: `onsuccess?.()`

### Data Flow

- Atoms: presentational only, no domain store access
- Molecules: may connect to domain APIs/stores for composed behavior
- Organisms: orchestrate page-level layout and cross-molecule state

## ANTI-PATTERNS

- Don't use inline styles; use class utilities
- Don't access stores directly in atoms; pass via props
- Don't skip `mergeClass` for the `class` prop
- Don't use `svelte:element` unless truly polymorphic (see `Icon.svelte`)
- Don't define shared TS types here; place reusable types in `$lib/components/models`
