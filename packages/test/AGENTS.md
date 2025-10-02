# Repository Guidelines

## base
- 中文回答
- 你只能修改test目录下代码，禁止修改其他package代码

## Project Structure & Module Organization
- `src/main.js` boots the Vue 3 app and wires Element Plus; keep global plugins here.
- Place reusable UI in `src/components/`; colocate component-specific styles inside the `<style scoped>` block of each `.vue` file.
- Global styles live in `src/style.css`; asset files such as logos stay under `src/assets/`.
- Build-only helpers reside in `scripts/` (e.g., `ensure-rolldown-flag.cjs`); avoid importing them into runtime code.
- Static entry points (`index.html`) and public assets belong in `public/` when they must bypass the bundler.

## Build, Test, and Development Commands
- `npm install` installs dependencies and runs the postinstall sanity check for the rolldown build flag.
- `npm run dev` starts Vite with the experimental Rolldown pipeline at `http://localhost:6000/`.
- `npm run build` produces an optimized production bundle in `dist/`.
- `npm run preview` serves the production build locally; use it to validate deployment artifacts.

## Coding Style & Naming Conventions
- Use 2-space indentation in JavaScript, Vue SFC templates, and JSON.
- Name Vue components in PascalCase (e.g., `UserMenu.vue`) and export them with the same casing.
- Prefer script setup syntax within `.vue` files and keep refs/composables ordered from general to specific.
- Run `npx eslint .` before submitting changes if you add ESLint; otherwise ensure code passes `npm run build` without warnings.

## Testing Guidelines
- No automated test harness is configured yet; when adding one, prefer Vitest to align with the Vite ecosystem.
- Group new tests under `tests/` mirroring the `src/` tree (e.g., `tests/components/HelloWorld.test.js`).
- Name test files with `.test.js` to enable future glob-based runners.
- Run smoke checks via `npm run preview` and manual browser validation until a formal suite exists.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) so changelogs can be generated automatically.
- Keep commits scoped and reversible; avoid bundling refactors with feature work.
- Open PRs against `main` with a short summary, testing notes (`npm run build`, preview checks), and screenshots for UI changes.
- Link related issues using the GitHub `Fixes #id` syntax and request a review before merging.
