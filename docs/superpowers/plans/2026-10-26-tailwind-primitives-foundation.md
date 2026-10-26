# Tailwind-only primitives foundation implementation plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task by task in the current session. Steps use checkbox syntax. The user subsequently authorized the full redesign as a long-running goal. No commit or publication is authorized.

**Goal:** Establish the reusable UI foundation required before generating Trixie's redesigned pages, with all authored styling expressed as Tailwind classes and intrinsic tags confined to primitive implementations.

**Architecture:** Own foundational components under `src/components/ui/`, adapt selected current shadcn components, and keep typed Tailwind class maps under `src/lib/ui/`. Route and feature components compose those building blocks. Keep the existing Next.js/next-intl/Supabase/page-flip architecture and preserve the latest 18 menu images.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind 4, selected shadcn/Radix primitives, existing `cn()`/clsx/tailwind-merge, and Node's test runner for source-rule checks.

**Scope:** Completed foundation slice; the subsequent public redesign was also authorized and implemented. The product design remains in [the redesign specification](../specs/2026-10-26-trixie-redesign-design.md). Flipbook and public-page implementation follow after this foundation; their behavioral requirements and sequence are specified below. Implementation and verification results are recorded in [the final report](../../reports/2026-10-26-trixie-implementation.md).

## File responsibilities

| File/location | Responsibility |
| --- | --- |
| `AGENTS.md` | Repository-wide conventions; created in the current planning change. |
| `components.json` | shadcn generator configuration, Tailwind colour utilities, owned UI aliases. |
| `src/lib/ui/styles.ts` | Complete, statically discoverable Tailwind class maps. |
| `src/components/ui/typography.tsx` | Owned semantic typography primitive. |
| `src/components/ui/layout.tsx` | Shared semantic layout primitives. |
| `src/components/ui/link.tsx` | Shared Next.js link primitive and external-link handling. |
| `src/components/ui/media.tsx` | Shared Next.js image primitive with fit/aspect/error behavior. |
| `src/components/ui/icon.tsx` | Shared icon rendering and accessible naming. |
| `src/components/ui/{button,dialog,sheet,select,tooltip,skeleton}.tsx` | Selected shadcn primitives, adapted to repo rules when used. |
| `scripts/check-ui-rules.mjs` | AST/style-source compliance check. |
| `scripts/tests/check-ui-rules.test.mjs` | Rule fixtures proving valid component composition and rejecting prohibited source. |
| `src/app/globals.css` | Tailwind import only after existing class dependencies are migrated. |
| `src/app/layout.tsx` | Font/build repair, Trixie metadata, required native document shell. |

Validation used equivalent `npm run` scripts because the installed pnpm launcher attempted an incompatible store migration in this environment. The baseline font error is recorded in the initial audit; the final report records its resolution.

## Task 1: Configure shadcn without CSS theme generation

- [x] Record the current baseline with `pnpm lint` and `pnpm typecheck`. The existing font subset error is expected; do not mistake it for a new failure.
- [x] Create `components.json` with the following configuration. `new-york` is a generator starting point; its visual defaults must be adapted to Trixie rather than copied across feature pages.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": false,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [x] Adapt the selected shadcn/Radix component patterns directly to the Tailwind-only policy. Implementation adjustment: the primitives were owned and reviewed directly rather than applying a generator that adds CSS theme output; no shadcn CLI execution is claimed. The following generator commands remain a reference for future additions, not a record of commands run.

```bash
trixie_shadcn_version="$(pnpm view shadcn version)"
pnpm dlx "shadcn@$trixie_shadcn_version" --version
pnpm dlx "shadcn@$trixie_shadcn_version" add button dialog sheet select tooltip skeleton
```

- [x] Review every generated file and dependency. Keep complete Tailwind utility classes, required behavior dependencies, refs, and accessibility semantics. Remove generator-added authored CSS/theme blocks/animation imports; replace their uses with static utility-class variants. Generate no unused component collection. Keep generated changes out of unrelated config.

## Task 2: Establish class maps and the owned Typography primitive

- [x] Create `src/lib/ui/styles.ts` with complete class strings. Colours appear here rather than being scattered through feature components.

```ts
export const surfaceStyles = {
  paper: 'bg-[#FFFAE7] text-[#15201C]',
  brand: 'bg-[#006B57] text-[#FFFAE7]',
  evening: 'bg-[#15201C] text-[#FFFAE7]',
  white: 'bg-white text-[#15201C]',
} as const;

export const typographyStyles = {
  display: 'text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl',
  title: 'text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl',
  heading: 'text-2xl font-semibold leading-snug text-balance md:text-4xl',
  subheading: 'text-xl font-semibold leading-snug text-balance md:text-2xl',
  lead: 'text-lg leading-relaxed text-pretty md:text-xl',
  body: 'text-base leading-relaxed text-pretty',
  small: 'text-sm leading-relaxed',
  caption: 'text-sm font-medium leading-normal',
} as const;

export const textToneStyles = {
  inherit: 'text-inherit',
  ink: 'text-[#15201C]',
  muted: 'text-stone-600',
  inverse: 'text-[#FFFAE7]',
  inverseMuted: 'text-stone-300',
  brand: 'text-[#006B57]',
} as const;

export const gapStyles = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-10',
} as const;

export const focusStyles =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current';
```

- [x] Create `src/components/ui/typography.tsx`. Keep it server-compatible; visual variants do not determine heading levels. The following is the initial implementation, not an import from shadcn.

```tsx
import {createElement, type HTMLAttributes, type Ref} from 'react';

import {textToneStyles, typographyStyles} from '@/lib/ui/styles';
import {cn} from '@/lib/utils';

type TextElement =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'small' | 'strong' | 'em'
  | 'blockquote' | 'figcaption';

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: keyof typeof typographyStyles;
  tone?: keyof typeof textToneStyles;
  ref?: Ref<HTMLElement>;
};

export function Typography({
  as = 'p',
  variant = 'body',
  tone = 'inherit',
  className,
  ref,
  ...props
}: TypographyProps) {
  return createElement(as, {
    ...props,
    ref,
    className: cn(typographyStyles[variant], textToneStyles[tone], className),
  });
}
```

- [x] Use these maps in owned compound text parts such as dialog titles/descriptions. Keep an appropriate semantic element; do not place a heading inside another heading. Use explicit inverse tones on dark surfaces rather than applying a light-surface muted colour everywhere.
- [x] Verify semantic tag selection, native attributes, ref forwarding, and class override behavior using rendered component checks. Check representative Vietnamese headings at 390px and 1440px; do not add snapshot tests for every static class string.

## Task 3: Add reusable semantic layout primitives

- [x] Create `src/components/ui/layout.tsx`. The initial primitives carry shared layout behavior and landmarks; expand them only for actual use cases.

```tsx
import {createElement, type HTMLAttributes, type Ref} from 'react';

import {gapStyles} from '@/lib/ui/styles';
import {cn} from '@/lib/utils';

type LayoutTag = 'div' | 'main' | 'section' | 'nav' | 'header' | 'footer' | 'article';
type LayoutProps = HTMLAttributes<HTMLElement> & {ref?: Ref<HTMLElement>};

function layoutPrimitive(tag: LayoutTag, base: string) {
  return function LayoutPrimitive({className, ref, ...props}: LayoutProps) {
    return createElement(tag, {...props, ref, className: cn(base, className)});
  };
}

export const Container = layoutPrimitive('div', 'mx-auto w-full max-w-7xl px-4 md:px-8');
export const Section = layoutPrimitive('section', 'scroll-mt-24 py-12 md:py-20');
export const Main = layoutPrimitive('main', 'min-h-dvh');
export const Surface = layoutPrimitive('div', 'min-w-0');
export const Navigation = layoutPrimitive('nav', 'flex items-center gap-4');
export const SiteHeaderFrame = layoutPrimitive('header', 'relative z-40 w-full');
export const SiteFooterFrame = layoutPrimitive('footer', 'py-12 md:py-16');
export const Article = layoutPrimitive('article', 'min-w-0');

type SpacingProps = LayoutProps & {gap?: keyof typeof gapStyles};

export function Stack({gap = 'md', className, ...props}: SpacingProps) {
  return createElement('div', {
    ...props,
    className: cn('flex min-w-0 flex-col', gapStyles[gap], className),
  });
}

export function Inline({gap = 'md', className, ...props}: SpacingProps) {
  return createElement('div', {
    ...props,
    className: cn('flex min-w-0 flex-wrap items-center', gapStyles[gap], className),
  });
}
```

- [x] Build link/media/icon primitives before their first feature consumers. Link forwards Next.js Link props/ref and exposes focus styles; Media forwards image props and provides typed `contain`/`cover` classes; Icon owns SVG imports and decorative/accessibility behavior. Add List/ListItem/Status/form primitives when required, with real semantic elements implemented only under `ui/`.
- [x] Verify the primitive layer with lint and TypeScript. Maintain the recorded font failure until the font is replaced in the migration; investigate any additional errors before consuming the primitives.

## Task 4: Add mechanical guardrails with meaningful fixtures

- [x] Create `scripts/check-ui-rules.mjs` with the following initial checker. It checks authored source rather than generated library DOM. Expand the same checker for additional bypasses discovered during review; do not widen its allowed paths.

```js
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

export function inspectSource(file, source) {
  const path = file.replaceAll('\\', '/');
  const primitive = path.startsWith('src/components/ui/');
  const document = path === 'src/app/layout.tsx';
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const issues = [];
  const report = (rule, node) => issues.push({
    file: path,
    line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
    rule,
  });
  const native = (name) => /^[a-z]/.test(name);
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName;
      const intrinsic = ts.isIdentifier(name) && native(name.text);
      const member = ts.isPropertyAccessExpression(name) && native(name.name.text);
      const shell = document && intrinsic && ['html', 'body'].includes(name.text);
      if (!primitive && !shell && (intrinsic || member)) report('primitive-boundary', node);
      if (intrinsic && name.text === 'style') report('authored-style-or-html', node);
    }
    if (ts.isJsxAttribute(node) && ['style', 'dangerouslySetInnerHTML'].includes(node.name.getText(ast))) {
      report('authored-style-or-html', node);
    }
    if (!primitive && ts.isCallExpression(node)) {
      const call = node.expression;
      const method = ts.isIdentifier(call) ? call.text :
        ts.isPropertyAccessExpression(call) ? call.name.text : '';
      const first = node.arguments[0];
      if (method === 'createElement' && first && ts.isStringLiteral(first) && native(first.text)) {
        report('intrinsic-factory', node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return issues;
}

export function inspectStyles(file, source) {
  const path = file.replaceAll('\\', '/');
  if (path === 'src/app/globals.css' && source.trim() === '@import "tailwindcss";') return [];
  return [{file: path, line: 1, rule: 'tailwind-import-only'}];
}

function* files(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.') || ['node_modules', 'public', 'docs', 'dist', 'out', 'coverage'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile()) yield path;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const issues = [];
  for (const path of files('.')) {
    const file = relative('.', path).replaceAll('\\', '/');
    if (/\.(css|scss|sass|less)$/.test(file)) {
      issues.push(...inspectStyles(file, readFileSync(path, 'utf8')));
    } else if (file.startsWith('src/') && /\.[jt]sx?$/.test(file)) {
      issues.push(...inspectSource(file, readFileSync(path, 'utf8')));
    }
  }
  for (const item of issues) console.error(`${item.file}:${item.line} ${item.rule}`);
  console.log(`UI source rules: ${issues.length} violation(s)`);
  process.exitCode = issues.length ? 1 : 0;
}
```

- [x] Create `scripts/tests/check-ui-rules.test.mjs` to prove the source boundaries using independent examples.

```js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource, inspectStyles} from '../check-ui-rules.mjs';

test('features compose components with semantic props', () => {
  assert.deepEqual(inspectSource('src/app/page.tsx',
    '<Section><Typography as="h1">Trixie</Typography></Section>'), []);
});

test('raw native tags and motion member tags are rejected in features', () => {
  for (const source of ['<div />', '<motion.article />']) {
    assert.equal(inspectSource('src/app/page.tsx', source)[0].rule, 'primitive-boundary');
  }
});

test('primitives can own DOM but cannot author inline styles', () => {
  assert.deepEqual(inspectSource('src/components/ui/layout.tsx', '<section />'), []);
  assert.equal(inspectSource('src/components/ui/layout.tsx',
    '<section style={{color: "red"}} />')[0].rule, 'authored-style-or-html');
  assert.equal(inspectSource('src/components/ui/layout.tsx',
    '<style>{"body { color: red }"}</style>')[0].rule, 'authored-style-or-html');
});

test('the document-shell exception does not permit nested raw feature UI', () => {
  assert.deepEqual(inspectSource('src/app/layout.tsx', '<html><body><Main /></body></html>'), []);
  assert.equal(inspectSource('src/app/layout.tsx', '<html><body><div /></body></html>').length, 1);
});

test('intrinsic factories and injected HTML cannot bypass components', () => {
  assert.equal(inspectSource('src/app/page.tsx', 'createElement("div", {})')[0].rule, 'intrinsic-factory');
  assert.equal(inspectSource('src/components/ui/rich-text.tsx',
    '<Surface dangerouslySetInnerHTML={{__html: content}} />')[0].rule, 'authored-style-or-html');
});

test('only the exact Tailwind entry stylesheet is accepted', () => {
  assert.deepEqual(inspectStyles('src/app/globals.css', '@import "tailwindcss";\n'), []);
  assert.equal(inspectStyles('src/app/globals.css', '@import "tailwindcss"; body {color:red}').length, 1);
  assert.equal(inspectStyles('src/components/menu.module.css', '.book {}').length, 1);
});
```

- [x] Run `node --test scripts/tests/check-ui-rules.test.mjs`; expect six passing tests. Run `node scripts/check-ui-rules.mjs`; expect failures in legacy source until the migration is complete. Treat this as a migration inventory, not a green release check. Manual review still checks style writes/unsafe spreads and semantic misuse the initial AST checker cannot prove.

## Task 5: Migrate the foundation and existing consumers safely

- [x] In `src/app/layout.tsx`, replace the failing DM Sans setup with `Be_Vietnam_Pro({subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700']})`. Apply its generated `className` and `surfaceStyles.paper` to the required body shell with `cn()`. Set Trixie metadata and preserve next-intl providers.
- [x] Convert current `bg-*`/`text-*` theme consumers to the owned class maps/primitives before removing their CSS definitions. Convert `site-header`, `locale-switcher`, `event-polaroids`, `flipbook-menu`, all current routes, not-found, and admin scaffold markup to component composition. Administrative functionality remains unchanged and separately scoped.
- [x] Replace event background-image styles with Media primitives; replace authored Framer Motion styles/member tags with Tailwind transition/state classes. Use ordinary image/media props for source URLs, not arbitrary background-image utilities built from runtime data.
- [x] Replace journal HTML injection with a safe node-to-component renderer. Allow supported text/headings/lists/links/media only; remove scripts, event-handler attributes, inline styles, and unsafe URL protocols. Unsupported blocks degrade to readable text. The renderer uses Typography, List/ListItem, Link, and Media primitives.
- [x] Keep engine configuration in MenuBook and translate `.menu-flipbook-stage`, wrapper, and sizing rules to owned primitives' Tailwind classes. Use documented engine dimensions/orientation options. Do not reintroduce CSS overrides for library internals.
- [x] After all CSS-dependent consumers have migrated, make `src/app/globals.css` contain exactly `@import "tailwindcss";` and a newline. Add `check:ui` to package scripts as `node scripts/check-ui-rules.mjs` and include it in the project's validation command alongside lint/typecheck/build. Do not claim legacy compliance until the full check returns zero.
- [x] Verify with `pnpm lint`, `pnpm typecheck`, `pnpm run check:ui`, `node --test scripts/tests/check-ui-rules.test.mjs`, and `pnpm build`. Investigate failures and rerun only affected checks until the final complete set passes. No commits or deployment are included in this plan.

## Subsequent product slices

These are separate implementation slices after the foundation, each using the component/style rules above. The redesign specification defines their behavior; create a focused implementation checklist for each when it starts.

1. **Flipbook:** update `src/lib/menu/build-menu-pages.ts` and menu types; download and inspect the latest 18 artwork pages; record source/order/category mapping; implement MenuViewer, MenuBook, MenuIndex, MenuToolbar, and MenuZoomDialog from primitives. Verify direct-page URLs, cover/spread boundaries, category jumps, zoom/expand, image failure, keyboard focus, and reduced motion at 390/768/1440px.
2. **Shared shell and home:** rebuild existing header/switcher, add footer, and compose home with Typography/layout/media primitives. Use verified stage/café imagery and show data; link the menu prominently; provide real reservation contact.
3. **Public secondary content:** align events, show details, journal/article reading, venue/gallery, and contact/private-event sections to the same components. Centralize venue contact and event information; never reintroduce placeholder performers or computed fictional dates.
4. **Release review:** run the complete source/build checks and browser scenarios on production output in both languages. Review screenshots and correct the highest-impact visual problems. Preserve original menu artwork. Keep backend admin CRUD and booking ingestion outside this visual project unless separately authorized.

## Completed product slices

- [x] Preserve and inspect all 18 current original menu pages; record origins, order, dimensions, and category mapping.
- [x] Build responsive spreads/single pages, category and thumbnail jumps, URL/history navigation, zoom/expand dialogs, keyboard handling, reduced motion, error/retry, and no-JavaScript image access.
- [x] Redesign the bilingual shared shell, home, events/details, journal/articles, venue/gallery, and visit/private-event sections using authentic Trixie assets and verified content.
- [x] Keep ended show URLs readable, hide their show-booking action, preserve authoritative empty data, and render stored article content safely through primitives.
- [x] Complete source checks, 49 regression tests, production build, independent code review, responsive/browser interactions, and screenshot critique. See the final report for evidence and intentional backend boundaries.

## Source decisions

- [shadcn configuration](https://ui.shadcn.com/docs/components-json): `cssVariables: false` generates Tailwind colour utilities.
- [shadcn typography/typeset guidance](https://ui.shadcn.com/docs/typeset): useful reference material, not a substitute for this repo's owned Typography component or permission to add CSS.
- `AGENTS.md` overrides imported design-skill examples that prescribe custom CSS or raw HTML feature compositions.
