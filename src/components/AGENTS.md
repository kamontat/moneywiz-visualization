# src/components — UI Components

## OVERVIEW

Atomic Design structure: atoms (primitives) → molecules (compositions) → organisms (page sections).

## STRUCTURE

```
components/
├── atoms/              # Single-purpose primitives (Button, Input, Text, Panel)
├── molecules/          # Small compositions (CsvUploadButton, ThemeSelect)
└── organisms/          # Page-level assemblies (AppHeader, AppBody, AppFooter)
```

## WHERE TO LOOK

| Task                  | Location                   |
| --------------------- | -------------------------- |
| Add button/input/text | `atoms/`                   |
| Compose atoms         | `molecules/`               |
| Add page section      | `organisms/`               |
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

### Children

- Accept via `children?: Children` in BaseProps
- Render via `{@render children?.()}`
- Omit from Props if component shouldn't have children

### Callbacks

- Use `CustomProps<{ onsuccess?: () => void }>` pattern
- Call directly: `onsuccess?.()`

## ANTI-PATTERNS

- Don't use inline styles; use class utilities
- Don't access stores directly in atoms; pass via props
- Don't skip `mergeClass` for the `class` prop
- Don't use `svelte:element` unless truly polymorphic (see `Icon.svelte`)
