# Repository Guidelines

## Project Structure & Module Organization
Core Next.js App Router code lives in `src/app`, with shared UI in `src/components`, reusable hooks in `src/hooks`, domain helpers in `src/lib`, and styling tokens in `src/styles`. Type definitions sit in `src/types` (frontend) and root-level `types/` (shared SDK). Tests live in `__tests__` for Jest suites, `e2e/` for Playwright specs, and visual aids in `design/`.

## Build, Test, and Development Commands
Use `npm run dev` for the local Next dev server. Ship-ready bundles come from `npm run build` followed by `npm run start` for smoke checks. `npm run lint` enforces ESLint (Next core-web-vitals). `npm run test`, `npm run test:watch`, and `npm run test:coverage` drive Jest; run `npm run test:e2e` or `npm run test:e2e:ui` for Playwright flows when debugging.

## Coding Style & Naming Conventions
Prettier (single quotes, no semicolons, Tailwind plugin) formats files?run `npx prettier --write .` before large refactors. Indentation is two spaces; avoid tabs. Use PascalCase for React components, camelCase for hooks/utilities, and kebab-case for route segment folders. Tailwind utilities are auto-sorted; keep custom tokens in `src/styles/tailwind.css`.

## Testing Guidelines
Author unit tests alongside features in `__tests__/<feature>.test.tsx`, using Testing Library helpers configured in `jest.setup.js`. Maintain ?80% coverage when running `npm run test:coverage`; call out gaps explicitly in PRs. Group end-to-end specs by surface in `e2e/<area>/<scenario>.spec.ts` and consult `docs/TESTING_FOUNDATION.md` for scenario templates. Generate HTML diagnostics with `PLAYWRIGHT_HTML_PATH=playwright-report`.

## Commit & Pull Request Guidelines
Follow the repo?s short, imperative commit style (`Add share modal`, `Fix auth guard`) and keep subjects under ~60 characters. PRs should describe the problem, outline the solution, and list validation (`npm run test`, screenshots for UI, links to test runs). Link related issues or Linear tickets and flag schema or config changes up front.

## Environment & Secrets
Create `.env.local` using the keys outlined in `docs/SUPABASE_SETUP_GUIDE.md`; never commit secrets. Use Supabase and Cloudinary credentials scoped to staging/non-production projects. When adding new variables, document defaults in `README.md` or `/docs`, and guard usage with defensive `process.env` checks to avoid runtime crashes.
