# Repository Guidelines

## Project Structure & Module Organization
- `src/app` houses the Next.js App Router pages and layouts.
- Shared UI lives in `src/components`, hooks in `src/hooks`, domain helpers in `src/lib`.
- Styling tokens are centralized in `src/styles` (see `src/styles/tailwind.css`).
- Types live in `src/types` (frontend) and `types/` at the repo root (shared SDK).
- Tests are split by scope: `__tests__/` (Jest), `e2e/` (Playwright), and `design/` for visual aids.

## Build, Test, and Development Commands
- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production bundle.
- `npm run start`: run the production build for smoke checks.
- `npm run lint`: run ESLint (Next core-web-vitals rules).
- `npm run test`, `npm run test:watch`, `npm run test:coverage`: run Jest suites.
- `npm run test:e2e`, `npm run test:e2e:ui`: run Playwright tests (UI mode for debugging).

## Coding Style & Naming Conventions
- Indentation is two spaces; avoid tabs.
- Prettier is configured with single quotes, no semicolons, and the Tailwind plugin. Run `npx prettier --write .` before large refactors.
- React components use PascalCase, hooks/utilities use camelCase, and route folders use kebab-case.
- Keep Tailwind utilities sorted; place custom tokens in `src/styles/tailwind.css`.

## Testing Guidelines
- Unit tests use Jest + Testing Library in `__tests__/<feature>.test.tsx` and reference helpers from `jest.setup.js`.
- Target ~80% coverage when running `npm run test:coverage` and call out gaps explicitly.
- Playwright specs live under `e2e/<area>/<scenario>.spec.ts`; see `docs/TESTING_FOUNDATION.md` for templates.
- For HTML reports, set `PLAYWRIGHT_HTML_PATH=playwright-report`.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects under ~60 characters (e.g., `Add share modal`).
- PRs should describe the problem, solution, and validation (commands, screenshots for UI, test links).
- Link related issues/Linear tickets and flag schema or config changes in the description.

## Environment & Secrets
- Create `.env.local` from `docs/SUPABASE_SETUP_GUIDE.md`; never commit secrets.
- Use staging/non-production Supabase and Cloudinary credentials.
- Document new env vars in `README.md` or `/docs` and guard access with `process.env` checks.
