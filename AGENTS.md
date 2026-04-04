# Repository Guidelines

# AGENTS.md

## Product context
This app helps Israeli consumers decide where to shop for groceries based on their current basket.

## Current architecture direction
- One active basket only; do not introduce real multi-list support.
- Use `rankStores()` as the single recommendation source.
- Use repositories under `src/data/*` instead of importing raw demo constants directly.
- Pass `userCoords` into selectors/helpers; do not call hooks inside plain functions.
- Preserve current Hebrew UI copy and layout unless a change is explicitly requested.

## Code preferences
- Prefer minimal, local refactors over broad rewrites.
- Keep selectors presentation-focused.
- Keep domain logic in `src/domain/recommendation/`.
- When changing UI files, preserve existing spacing/layout/text where possible.

## When finishing work
Always summarize:
- files changed
- why they changed
- any follow-up work still recommended

## Project Structure & Module Organization
This repository is an Expo Router app. Route files live in `app/`, including grouped tab screens in `app/(tabs)/` and dynamic routes such as `app/list/[listId].tsx` and `app/store/[storeId].tsx`. Shared application code lives in `src/`, organized by responsibility: `components/` for UI, `features/` for stateful user flows, `domain/` for ranking and pricing logic, `data/` for repository access, `utils/` for helpers, and `constants/` or `lib/constants/` for seeded data. Static images and app icons live in `assets/images/`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Use `npm run start` to launch the Expo dev server, `npm run android` or `npm run ios` to run native builds, and `npm run web` to open the web target. Run `npm run lint` before opening a PR; it uses Expo's ESLint setup. `npm run reset-project` is a scaffold reset script from Expo and should only be used intentionally.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode assumptions in mind. Follow the existing style: 2-space indentation, double quotes, semicolons, and small functional React components. Use PascalCase for components (`AppHeader.tsx`), camelCase for functions and selectors (`getStoreDecisionScore.ts`), and colocate feature state under `src/features/<feature>/`. Prefer the `@/*` path alias for imports rooted at the repository. Keep route files focused on screen composition and push reusable logic into `src/`.

## Testing Guidelines
There is no dedicated automated test suite configured yet. Until one is added, treat linting plus manual verification as required: run `npm run lint`, then exercise the affected flows in Expo on at least one target platform. For logic-heavy changes in ranking, basket state, or selectors, validate edge cases directly in the relevant screens and document what you checked in the PR.

## Commit & Pull Request Guidelines
Recent commits favor short, imperative summaries, sometimes with a conventional prefix such as `refactor:`. Keep commit messages specific to one change, for example `feat: add store comparison empty state`. PRs should include a concise description, note impacted screens or routes, link the relevant issue when available, and attach screenshots or recordings for UI changes. Call out any manual verification steps and data assumptions.
