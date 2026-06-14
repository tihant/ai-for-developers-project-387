# AGENTS.md

## Project layout

Two separate packages with their own `node_modules` and `package.json`:

- **`/` (root)** — TypeSpec API spec → compiles to OpenAPI
- **`/frontend`** — Vite + React 19 + shadcn/ui app

## API contract workflow

The source of truth is `spec/main.tsp`. To update the frontend API types:

```bash
# 1. Edit spec/main.tsp, then compile to OpenAPI
npm run compile                          # outputs openapi/@typespec/openapi3/openapi.yaml

# 2. Copy spec to frontend
cp openapi/@typespec/openapi3/openapi.yaml frontend/openapi.yaml

# 3. Generate TypeScript types in frontend
cd frontend && npm run generate-types    # outputs src/api/types.ts
```

`openapi/` is gitignored (generated artifact). `frontend/openapi.yaml` and `frontend/src/api/types.ts` are tracked.

## Frontend dev workflow

```bash
cd frontend

# Terminal 1 — mock API server (port 4010)
npm run mock-api

# Terminal 2 — Vite dev server (port 5173)
npm run dev
```

The Vite dev server reads `VITE_API_URL` from `.env` (defaults to `http://localhost:4010` — Prism mock).

## Frontend stack quirks

### shadcn/ui uses `@base-ui/react` (not Radix)

There is **no `asChild` prop** on the Button component. To render a `<Link>` that looks like a button, import `buttonVariants` and use it as a className:

```tsx
import { buttonVariants } from '@/components/ui/button';
<Link to="/path" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
  Text
</Link>
```

### shadcn components.json aliases

Uses `./src/` prefix, not `@/`. The default `@/` prefix caused files to be created in a literal `@/components/` directory. If re-initializing shadcn, fix `components.json` aliases.

### TypeScript pinned to ~5.7.0

Vite scaffolded with TS 6.x, but `openapi-typescript` 7.x requires TS ^5.x. Pinned to `~5.7.0`. If upgrading TS, verify peer deps resolve.

### `erasableSyntaxOnly` removed from tsconfig

TS 6.x compiler option — removed from both `tsconfig.app.json` and `tsconfig.node.json` to work with TS 5.7.

## Typed API client

`src/api/client.ts` is an `openapi-fetch` client typed with the generated `src/api/types.ts`. All API calls go through it — never use raw `fetch`.

Error responses are typed as `never` for operations that lack error schemas in the spec. Use `if (apiError)` without accessing `.message` — use a fixed string instead.

## Build & verify

```bash
cd frontend
npm run build     # runs tsc -b (typecheck) then vite build
npm run lint      # eslint
```

## Commit conventions

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/). The type prefix is required:

```
feat: add booking cancellation
fix: handle empty event types list
docs: update API spec
chore: upgrade dependencies
refactor: extract slot generation logic
test: add booking flow e2e test
```

The CI will validate commit messages on pull requests using commitlint.

## Release automation

Releases are managed by release-please. Every push to `main` triggers a check: if there are unreleased conventional commits, release-please creates or updates a Release PR with a changelog and proposed version bump. Merging the Release PR creates a GitHub Release.

## E2E tests

```bash
cd frontend
npm run test:e2e      # Playwright tests (requires backend + frontend running)
```

Playwright config at `frontend/playwright.config.ts` starts the backend and Vite dev server automatically via `webServer`.

## Adding shadcn components

```bash
cd frontend
npx shadcn add <component-name> -y
```
