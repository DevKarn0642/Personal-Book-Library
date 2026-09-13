---
name: personal-book-library-frontend
description: Build or modify the Personal Book Library frontend. Use when adding React pages, UI components, API integration, state, styles, or client-side routes in frontend/.
---

# Personal Book Library Frontend Rules

Apply these rules to every change inside `frontend/`. The outcome must be a
feature-oriented React application that remains predictable to navigate,
read, test, and maintain.

For the complete directory map and API example, read
[`../structure.md`](../structure.md) before adding a new feature or changing
the application architecture.

## Baseline

- Keep the application in JavaScript/JSX. Do not introduce TypeScript into one
  feature only; migrate the application deliberately if TypeScript is wanted.
- The stack is React + Vite with Ant Design available. Prefer existing React,
  browser, and Ant Design capabilities before adding a package.
- The current project has no router or state-management dependency configured.
  Add one only when the feature genuinely requires it, and centralize its setup
  under `src/app/`.
- Do not replace or restore unrelated user changes.

## Directory ownership

```text
src/app/                 application composition: providers, router, root App
src/layouts/             reusable page shells
src/features/<feature>/  all domain-specific UI and logic
src/services/            generic HTTP infrastructure only
src/shared/              domain-neutral code reused by multiple features
src/store/               state shared across features only
src/assets/              bundled images and icons
public/                  static files addressed by a fixed URL
```

- Keep business code in `src/features/<feature>/`; use the existing
  `src/features/template/` structure as the starting point.
- A feature may contain only the folders it uses: `pages`, `components`,
  `services`, `hooks`, and `store`.
- Do not move domain-specific code to `shared/` pre-emptively. Move it only
  after it is genuinely reusable and expose it through a clear props/function
  API.
- `App.jsx` composes providers and the router. It must not become the
  implementation of a feature page.
- Keep common page chrome in `MainLayout` or `AuthLayout`; do not duplicate
  headers, sidebars, or access checks across pages.

## Dependency direction

Imports must move toward common layers:

```text
app → layouts + features + shared + services
features/<feature> → its own files + shared + services
shared → shared only
```

- Do not make deep imports into another feature. Refactor a truly common piece
  to `shared/`, or compose the features at the app level instead.
- There is no Vite import alias. Use explicit relative imports consistently;
  do not introduce `@/` until its Vite configuration is added for the whole
  project.

## Adding a feature

1. Create `src/features/<feature-name>/` using kebab-case for the directory.
2. Put route-rendered containers in `pages/`, focused UI in `components/`,
   feature endpoints in `services/`, and reusable asynchronous/page logic in
   `hooks/`.
3. Add a feature store only when state is shared by multiple parts of that
   feature. Use component state for local inputs and interactions.
4. Register URLs centrally in `src/app/router/`. Choose a layout and perform
   route-level authorization there instead of adding redirect logic to every
   component.
5. Preserve all states exposed to the user: initial/loading, successful data,
   empty data, expected errors, and mutation success/failure.

## Components and state

- Name React components and files in PascalCase (for example,
  `BookListPage.jsx`); name functions, hooks, and variables in camelCase (for
  example, `useBooks`).
- Pages coordinate data and layout. Components render focused UI and receive
  data/callbacks through props. Hooks coordinate lifecycle and async logic.
- Avoid prop drilling only when it becomes real friction. Use feature context
  or store before making unrelated state global.
- Make state transitions explicit. Disable duplicate submissions and clean up
  asynchronous effects when needed.

## API and errors

- Never call `fetch()` directly from a page or component. Feature services must
  use `src/services/api.js` and expose domain functions such as `listBooks()`
  or `createBook()`.
- Keep URL construction, authentication headers, common response parsing, and
  shared error mapping in `src/services/api.js` when they become common.
- `apiRequest()` currently returns the raw `Response`. Until that contract is
  changed centrally, every feature service must check `response.ok`, throw a
  meaningful error, and return parsed JSON consistently.
- Use only `VITE_*` variables for browser-visible configuration. Never put
  secrets, credentials, or private API keys in frontend environment files.

## UI and CSS

- Prefer Ant Design for standard controls. Wrap it in `shared/components/`
  only when a reusable project-specific API or default behavior is needed.
- Keep global reset, tokens, and broad typography in `src/index.css`. Co-locate
  feature/page CSS with its JSX; do not add feature selectors to global CSS.
- Use a component-scoped class convention such as `book-list__toolbar`.
  Avoid new global ID selectors and selectors that depend on another page's DOM.
- Import bundled assets from `src/assets/`; put only fixed-URL static files in
  `public/`.
- Meaningful images need descriptive `alt` text; decorative images use
  `alt=""`.

## Quality gate

- Keep each change focused and remove dead imports, unused state, and temporary
  debugging code before finishing.
- Run these commands from `frontend/` after code changes:

  ```bash
  npm run lint
  npm run build
  ```

- Verify the UI at relevant screen sizes and exercise happy, loading, empty,
  and error paths. Do not call the work complete if the build or lint check
  fails.
