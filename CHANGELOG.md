# varhyme

## 0.5.1

### Patch Changes

- 99504f4: feat(tokens): :sparkles: make `Tokens(config?)` optional, so calling `Tokens()` with no config returns the full default token style object

## 0.5.0

### Minor Changes

- 61b3152: refactor!: :recycle: rename package from `varena` to `varhyme`, and the public `Varena` interface to `Varhyme`

## 0.4.14

### Patch Changes

- 5505974: refactor(tokens): :art: standardize CSS zero values — standalone `radius-none` and `spacing-0` to `0px`, shadow offsets in `text-shadow-*` to `0`

## 0.4.13

### Patch Changes

- e0e5e02: refactor(styles,tokens): :recycle: replace hand-maintained structural checks with Symbol brands in `isStyles` and `isTokens`

## 0.4.12

### Patch Changes

- d897f2c: perf(tokens): add early-return guard for empty config in `atProperties()`

## 0.4.11

### Patch Changes

- 0e31c63: feat(tokens): :sparkles: add `Tokens.atProperties()` for generating CSS `@property` at-rules

## 0.4.10

### Patch Changes

- 7202814: perf(utils): :zap: optimize `cx` and `sx` runtime performance

  - Replace rest parameters with `arguments` to avoid array allocation
  - Replace `for...of` with index-based `for` loops
  - Replace template literals with `+` concatenation in `cx`

## 0.4.9

### Patch Changes

- 64c6f65: refactor(design-system): :recycle: rename color-danger to color-error and remove font-heading/body roles

  - Renamed `color-danger` and `color-danger-foreground` to `color-error` and `color-error-foreground`
  - Removed `font-heading` and `font-body` semantic font-family roles, only generic font stacks (`font-sans`, `font-serif`, `font-mono`) remain

## 0.4.8

### Patch Changes

- d157718: refactor(design-system): :art: standardize shadow tokens on HSL format

  - Migrated EffectTokens shadow values from `rgb(0 0 0 / x)` and `#0000` to HSL format
  - Migrated FilterTokens drop-shadow values from `rgb(0 0 0 / x)` and `#0000` to HSL format

## 0.4.7

### Patch Changes

- 63fe0c0: feat(styles): :sparkles: support extending style definitions in `Styles.extend()`

## 0.4.6

### Patch Changes

- 58eb6cc: feat(tokens): :sparkles: support adding new keys in `Tokens.extend()`

## 0.4.5

### Patch Changes

- ded05bf: feat(tokens): :sparkles: add `{key}` reference syntax for `createTokens`

  Token values can now reference other tokens using `{key}` and `{key ?? fallback}` syntax. `{key}` is dereferenced to `var(--prefix-key)`, and `{key ?? fallback}` to `var(--prefix-key, fallback)`, equivalent to `variable('key')` and `variable('key', 'fallback')`.

- 47a0028: refactor(design-system): :recycle: use `calc({key} * n)` for derived border, spacing, and typography tokens

  BorderTokens (`radius-xs`–`radius-4xl`), SpacingTokens (`spacing-0_5`–`spacing-96`), and TypographyTokens (`text-xs`–`text-9xl`) now use `calc({key} * n)` relative references instead of hardcoded rem values. Multipliers are the scale factors from the base token (e.g., `calc({radius} * 0.25)` for `radius-xs`). `calc({key} * 1)` is simplified to `{key}`, and `calc({key} * 0)` to `0`.

- ffb6350: refactor(design-system): :recycle: split `PaletteSystem` into individual color systems

  `PaletteSystem` has been split into 27 individual color systems, each with its own type and tokens pair (e.g., `RedSystem` + `RedTokens`, `BlueSystem` + `BlueTokens`). `PaletteSystem` and `PaletteTokens` are removed. `DesignSystem` is reordered by usage frequency, with color palette systems in definition order at the end.

## 0.4.4

### Patch Changes

- 134c5a0: refactor(tokens): :recycle: remove implicit :root default from css()

  css() no longer defaults to :root — pass :root explicitly when a selector is needed.

## 0.4.3

### Patch Changes

- ee4ed7f: refactor(design-system): :art: standardize color tokens on HSL format
  - Migrated PaletteTokens values from space-separated RGB to HSL format
  - Migrated ColorTokens values from space-separated RGB to HSL format
  - Changed cursor-interactive value from "default" to "pointer"

## 0.4.2

### Patch Changes

- e4f8f31: feat(design-system): :zap: optimize tree-shaking for DesignTokens
  - Wrap `createTokens` call in `run()` function for better tree-shaking support

## 0.4.1

### Patch Changes

- 555362a: feat(design-system): :art: add default tokens to BorderTokens and TypographyTokens
  - Add `radius` token (default: "0.5rem") to `BorderSystem` and `BorderTokens`
  - Add `text` token (default: "1rem") to `TypographySystem` and `TypographyTokens`

## 0.4.0

### Minor Changes

- 38bad1f: Add built-in design system tokens
  - Add `varena/design-system` entry point with animation, border, color, effect, filter, interactivity, layout, palette, spacing, and typography tokens

## 0.3.2

### Patch Changes

- 724638b: docs: :memo: simplify API documentation style

## 0.3.1

### Patch Changes

- c9ca716: refactor: :recycle: optimize variant resolution in `createStyles`

  - Replace `.reduce()` with explicit `for...of` loops for readability
  - Pre-compute compound variant conditions to avoid redundant iteration
  - Extract `slotsEntries` outside `create()` to avoid repeated `Object.entries()`
  - Rename `isMatched` → `isMatch`, `isNonEmptyVariantsValue` → `hasDefinedVariants`

- bc4e41f: refactor: :recycle: add `Slots` utility type to normalize slot value types to `string`

## 0.3.0

### Minor Changes

- 2988818: refactor!: :recycle: rename `classes` to `slots` throughout the API

  **BREAKING CHANGE:** All `classes` references renamed to `slots` to align with slot-based architecture.

  Changes:

  - `ClassesValue` → `SlotsValue`
  - `styles.classes` → `styles.slots`
  - `config.classes` → `config.slots`
  - `Styles.classes` → `Styles.slots`
  - `compoundVariant.classes` → `compoundVariant.slots`

## 0.2.9

### Patch Changes

- 47ee512: docs: :memo: rewrite README with comprehensive Quick Start tutorial

  Add Button component tutorial with Tailwind CSS, file structure, TypeScript integration, and usage examples. Restructure API Reference with detailed examples per function.

## 0.2.8

### Patch Changes

- e04b476: docs: :memo: add type utilities usage examples

## 0.2.7

### Patch Changes

- 4564aa4: feat: :sparkles: add `Tokens.css(config, selector?, wrapper?)` overload

  Support passing a config object to generate CSS with token overrides.

## 0.2.6

### Patch Changes

- f8208b7: feat: :sparkles: add Tokens.css() method for generating CSS strings from design tokens

## 0.2.5

### Patch Changes

- d2f4a5c: docs: add documentation for ExtractStylesConfig, ExcludeStylesConfig, ExtractComponentStylesConfig, and ExcludeComponentStylesConfig

## 0.2.4

### Patch Changes

- 69ee1dc: feat: add `ExtractStylesConfig`, `ExcludeStylesConfig`, `ExtractComponentStylesConfig`, and `ExcludeComponentStylesConfig` for pattern-based class filtering

  Support pattern-based class filtering via `Extract`/`Exclude` semantics:

  - `ExtractStylesConfig<typeof styles, "_${string}">` / `ExtractComponentStylesConfig<typeof styles, "_${string}">` - extract classes by pattern
  - `ExcludeStylesConfig<typeof styles, "_${string}">` / `ExcludeComponentStylesConfig<typeof styles, "_${string}">` - exclude classes by pattern

## 0.2.3

### Patch Changes

- f6a7924: Expose `isTokens` and `isStyles` type guards
- d4b3cea: Refactor: reorganize internal utilities into `src/shared/` directory

## 0.2.2

### Patch Changes

- 461b0b6: refine API reference and examples; standardize naming and style terminology

## 0.2.1

### Patch Changes

- 55c84a0: improve createStyles and createTokens functions for clarity and consistency

## 0.2.0

### Minor Changes

- 84d4473: introduce varena (first version)
