# AGENTS.md - node-eslint-config

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

`@bugs5382/node-eslint-config` holds the shared Oxlint and oxfmt configs used across Bugs5382
projects (and usable publicly). It ships JSON Oxlint configs that a repo `extends` from
`node_modules`, and an oxfmt settings module a repo re-exports from `oxfmt.config.ts`. There's no
build and no JavaScript API.

- `configs/base.json` is the default: ESLint core, TypeScript (type-aware), React, Unicorn, Import,
  perfectionist and the house rules.
- `configs/a11y.json`, `testing.json`, `storybook.json` and `typedoc.json` are opt-ins a repo adds
  to `extends`.
- `configs/oxfmt.mjs` holds the formatter settings, which print what Prettier 3 printed with its
  defaults.

## How the rules are kept

Every rule the old ESLint config enforced still runs. Rules Oxlint implements natively run natively.
The rest run through Oxlint's JS plugin support, which loads the ESLint plugin itself: perfectionist,
testing-library, storybook and typedoc as whole plugins, and the Unicorn and React rules Oxlint
lacks under the aliases `unicorn-js` and `react-js`. `RULES.md` lists them all.

- JS plugins are alpha in Oxlint, so every ESLint plugin is pinned to an exact version in
  `dependencies`. `eslint` is a dependency too, because some plugins load it.
- Oxlint's globs take `{a,b}` but not the `@(a|b)` and `?(x)` forms some ESLint presets use, so
  override `files` use brace forms only.
- `ignorePatterns` in an extended config are read relative to that config, so the configs carry
  none; the README gives repos the list to put in their own `.oxlintrc.json`.
- When Oxlint adds a native version of a `unicorn-js` or `react-js` rule, move it back to the native
  plugin and drop it from `RULES.md`.

## Layout

- `configs/` holds everything the package ships.
- `__tests__/lint.test.ts` installs the configs into a copy of `__tests__/fixtures/consumer` the way
  a real repo would, runs Oxlint and checks one rule from every plugin fires. The fixture's config is
  stored as `oxlintrc.fixture.json` so this repo's own lint run doesn't load it.
- `__tests__/format.test.ts` checks oxfmt prints what Prettier printed for `__tests__/fixtures/format`.
- `__tests__/package.test.ts` checks the tarball holds `configs/`, the README, the licence and the
  manifest, and nothing else.

## Test, lint and format

- Test: `npm test` (vitest).
- Lint: `npm run lint` (`oxlint`, with this repo's `.oxlintrc.json` extending `configs/base.json`).
- Format: `npm run format`, or `npm run format:check` in CI.
- Package hygiene: `npm run lint:npm` (npmPkgJsonLint) and `npx sort-package-json`.
- License headers: `task golic-run -- ...` (golic verifies the MIT header on every source file in
  CI; the copyright holder is configured as `2026 Shane` in `Taskfile.yaml`).

## CI

This is a public repo, so every job runs on GitHub-hosted runners (`runs-on: ubuntu-latest`) and
sets a `timeout-minutes`.

- Pull requests only, and never while the PR is a draft: CI starts when the PR is marked ready.
  Nothing reruns on the push to `main` after a squash merge, because the PR run already tested
  the tree being merged.
- **PR Checks** (`job-pr-checks.yaml`) is one job whose steps are the PR title, PR body, hygiene,
  gitleaks and categorizing-label checks. It is the only workflow that reruns when a PR's title
  or body is edited.
- **Test** (`action-test.yaml`) tests, lints and checks formatting on three Node versions. **GoLic** checks license headers. **License Check** checks npm
  dependency licenses, and only runs when `package.json` or the lockfile changes.
- On `main`, **Release Manager** prepares the changelog and version, and **Label Sync** runs when
  `.github/labels.yml` changes. **Release and Publish** runs Test again and then publishes to npm
  when a release is published.

## Conventions and gotchas

- See `CLAUDE.md` for the branch/commit/PR rules; they are enforced by the git hooks in
  `.claude/hooks` (run `bash .claude/hooks/install.sh` once per clone).
- Run npm with `--ignore-scripts`, as CI does.
- Changing a rule: edit the config in `configs/`, add a fixture file that breaks it to
  `__tests__/fixtures/consumer`, and list it in `RULES.md` if it runs through a JS plugin.
