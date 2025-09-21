# Repository Guidelines

## Project Structure & Module Organization
The marketing site runs on Next.js App Router under `src/app/[locale]`, with locale-aware pages and shared layout in `src/app/layout.tsx`. Visual building blocks live in `src/components`, split into `layout` wrappers and `sections` rendered on the home screen. Internationalized copy is stored in `messages/en.json` and `messages/zh.json`, while static assets such as favicons reside in `public`. Configuration lives at the repo root (`next.config.ts`, `eslint.config.mjs`, `tsconfig.json`).

## Build, Test, and Development Commands
Use `npm install` to sync dependencies. `npm run dev` starts the Turbopack dev server with hot reload. `npm run build` performs a production build and type checks. `npm start` serves the built bundle for smoke tests. Run `npm run lint` before every commit to enforce ESLint and Next.js rules.

## Coding Style & Naming Conventions
Write React components and hooks in TypeScript with strict mode. Follow the prevailing 2-space indentation, keep JSX props on separate lines when they wrap, and favor functional components. Name components and files in `PascalCase`, hooks in `useCamelCase`, and utility modules in `camelCase`. Import from the `@/` alias instead of long relative paths. Tailwind utility classes should be grouped logically (layout > spacing > typography) to ease scans.

## Testing Guidelines
There is no dedicated automated test suite yet; rely on `npm run lint` and a full `npm run build` to catch regressions. Smoke the localized routes (`/[locale]`) in both languages, validate links, and ensure responsive behavior at common breakpoints (375px, 768px, 1280px). When adding critical features, include snapshot or interaction coverage (e.g., Playwright or Testing Library) alongside the component under `src/`.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) as seen in `git log`, keeping the summary under 72 characters and writing detailed context in the body if needed. Branch names should mirror the change scope (e.g., `feature/localized-hero`). Before opening a PR, run build + lint, note any localization updates, and attach mobile/desktop screenshots for visual components. Reference related issues or tickets in the PR description.

## Localization Workflow
Whenever you touch user-facing text, update both `messages/en.json` and `messages/zh.json`, keeping keys consistent with the existing source-language convention. Verify translations through the dev server by switching locales and ensure fallbacks render correctly. Avoid hard-coded strings in components; pull them from the message catalog instead.
