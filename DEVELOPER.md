DEVELOPER.md

Purpose
-------
A concise, practical developer guide for contributors and automation agents (e.g., AI assistants). Focuses on the repository layout, common patterns, how to add or improve renderers, testing and QA steps, common pitfalls, and recommended workflows. Use this as a hands-on cheat sheet to get productive quickly.

Quick start
-----------
- Clone and install: npm install (use --legacy-peer-deps if peer conflicts)
- Dev app: npm run dev
- Run tests: npm run test
- Build: npm run build
- Lint: npm run lint
- Type check: npm run type-check

Repository overview
-------------------
Top-level structure (high level):
- src/
  - controls/       : basic form controls (string, number, boolean, etc.)
  - complex/        : combinator and composite renderers (array, object, oneOf, etc.)
  - layouts/        : layout renderers (vertical, horizontal, group)
  - additional/     : auxiliary renderers (labels, lists with detail)
  - extended/       : enhanced renderers (autocomplete variants)
  - util/           : shared utilities (composition helpers, date helpers, options)
  - styles/         : CSS tokens and styling utilities
  - i18n/           : translation utilities
  - renderers.ts    : master registry export for primevueRenderers
- tests/unit/       : Vitest unit tests
- example/          : example application and sample schemas

Key architectural patterns
--------------------------
1. Dual-file renderer pattern (recommended):
   - Component: ControlName.vue — the Vue component using usePrimeVueControl/useJsonFormsControl
   - Entry: ControlName.entry.ts — exports renderer and tester (rankWith)

2. Composition utilities:
   - usePrimeVueControl(): standard wiring (styling, onChange, debounce, focus)
   - useJsonFormsControl(): core JSONForms control logic
   - useComputedLabel(), useStyles(), primeVueProps(), persistentHint(), isControlEditable()

3. ControlWrapper component
   - Centralized wrapper that renders label, errors, hints, and consistent styling. Reuse it for all controls.

4. Tester and ranking
   - Use tester functions + rankWith(priority, testerFn) to select the correct renderer. Higher rank wins.
   - Support explicit options (enable/disable) + auto-detection for best UX (three-state logic: true/false/auto).

How to add or improve a renderer (practical steps)
-------------------------------------------------
1. Plan
   - Read existing similar controls to mirror patterns (component API, appliedOptions, styling, tests).
   - Decide tester logic: explicit option vs auto-detect. Prefer three-state logic: options.myRenderer true/false/auto.

2. Implement component (src/controls/YourControl.vue)
   - Use <script lang="ts"> and Composition API.
   - Wire up useJsonFormsControl(props) and usePrimeVueControl(...).
   - Implement value transforms (trim, filter empty, conversions) in the transform function passed to usePrimeVueControl.
   - Expose appliedOptions for PrimeVue props and placeholders.
   - Use ControlWrapper to show labels/errors/hints and apply styles.

3. Create entry file (src/controls/YourControl.entry.ts)
   - Implement isYourControl(uischema, schema) detection logic.
   - Export entry with rankWith( priority, isYourControl ).

4. Register
   - Export the entry from src/controls/index.ts so it is included in the main registry.
   - No changes usually required in src/renderers.ts if index exports the array.

5. Add example schema/data
   - Update example/src/schemas.js with a minimal schema + uischema + sample data for manual QA.

6. Tests
   - Add unit tests in tests/unit/ following mountJsonForms pattern.
   - Validate rendering, interactions, and transform logic.

7. QA checklist before PR
   - npm run type-check (no TypeScript errors)
   - npm run lint (fix eslint warnings/errors)
   - npm run build (ensure build outputs)
   - npm run test (all tests pass)
   - Manual check in example app

Common pitfalls and how to avoid them
------------------------------------
- Template syntax errors: Vue templates are parsed strictly by TypeScript tooling — ensure quotes and binding syntax are correct.
- Unused imports: ESLint flags unused imports; import only what you use.
- Peer dependency conflicts: If npm install fails due to peer ranges, use npm install --legacy-peer-deps for development.
- Tester misclassification: Use explicit options override and auto-detection combination to avoid accidental renderer selection.

Testing patterns
----------------
- Use mountJsonForms utility from tests/util to mount components with a schema, uischema and renderers array.
- Tests should cover:
  - Rendering of expected DOM elements
  - Value transforms (trimming, parsing, storage formats)
  - Disabled/readonly states
  - Error display when validation fails
- Add example schemas to example app for manual QA and regression checks.

Versioning, branches and PR workflow
-----------------------------------
- Use feature branches: feat/short-description (e.g., feat/chips-array-renderer)
- Commit messages: include concise summary and bullet details. Add Co-authored-by trailer if generated with Copilot.
- PR content: Explain what changed, why, how to test, and list modified/created files.
- Cross-fork PRs: add upstream remote and use gh pr create --repo owner/repo --head fork:branch

Helpful CLI commands
--------------------
- npm install --legacy-peer-deps
- npm run dev
- npm run build
- npm run test
- npm run lint
- npm run type-check
- gh pr create — create pull requests (set repo defaults with gh repo set-default)

Guidance for AI agents or automation
-----------------------------------
- Follow repository patterns strictly (dual-file renderer pattern, usePrimeVueControl signatures).
- Prefer non-invasive changes: add new files, export them in index, avoid changing core behavior.
- When resolving conflicts, prefer human review for production changes (especially peer dependency changes).
- For code generation: produce tests and example schema entries alongside implementation.

Storage & Date handling (common example)
----------------------------------------
- Keep default behavior unchanged unless user opts in via options.
- For Date/DateTime controls consider separate display vs storage formats (e.g., utc:true -> store ISO UTC, display local time).
- Reuse src/util/datejs.ts and the dayjs utc plugin already configured in the repo.

Checklist before marking feature as ready
-----------------------------------------
- [ ] Code matches repository patterns
- [ ] Unit tests added and passing
- [ ] Type-check and lint pass
- [ ] Build outputs verified
- [ ] Example updated for manual QA
- [ ] PR description documents testing and migration notes (if any)

Troubleshooting tips
--------------------
- If build or install fails: inspect peer dependency conflict messages and consider --legacy-peer-deps for development.
- If lint fails: run eslint autofix and address remaining issues.
- If a renderer is not selected: ensure tester rank is higher than competing renderers and explicit options are respected.

Further reading and resources
-----------------------------
- JSONForms docs: testers, renderers, ui schema
- PrimeVue docs: component props and events (e.g., Chips)
- Vue 3 Composition API: defineComponent, ref, computed, provide/inject
- TypeScript: strict typings for component props and utility functions

Contact and contribution etiquette
----------------------------------
- Open an issue for design/behavior discussions before large changes.
- Keep PRs small and focused.
- Provide usage examples and migration notes for breaking or opt-in behavior.

---
Generated: 2026-05-22

