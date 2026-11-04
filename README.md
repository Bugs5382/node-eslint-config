# node-oxlint-config 🧹

> 🪄 Shared Oxlint and oxfmt configs used across Bugs5382 projects.

![npm version](https://img.shields.io/npm/v/@bugs5382/node-oxlint-config?style=for-the-badge&logo=npm&label=version)
![npm downloads](https://img.shields.io/npm/dm/@bugs5382/node-oxlint-config?style=for-the-badge&logo=npm&label=downloads)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Overview

This package holds the lint rules and formatting every
[`@Bugs5382`](https://github.com/Bugs5382) JavaScript and TypeScript project uses. Linting runs on
[Oxlint](https://oxc.rs/docs/guide/usage/linter) and formatting on
[oxfmt](https://oxc.rs/docs/guide/usage/formatter), both from the Oxc project and both much faster
than ESLint and Prettier. You can use it in your own projects too.

- ⚡ **Oxlint, with nothing lost:** every rule the old ESLint config enforced still runs, natively
  where Oxlint has the rule and through its ESLint plugin support where it doesn't
  ([RULES.md](RULES.md)).
- 🎨 **Prettier's output, from oxfmt:** the formatter settings print what Prettier 3 printed with its
  defaults, so switching doesn't reformat your code.
- 🧩 **Opt-ins:** accessibility, Testing Library, Storybook and TypeDoc rules, each its own config.

## 📦 Installation

```bash
npm install --save-dev @bugs5382/node-oxlint-config oxlint oxfmt
```

## ⚙️ Usage

### Linting

Create `.oxlintrc.json`, extend the base config, and list what Oxlint should skip:

```json
{
  "extends": ["./node_modules/@bugs5382/node-oxlint-config/configs/base.json"],
  "ignorePatterns": [
    "dist/**",
    "lib/**",
    "coverage/**",
    "docs/**",
    "storybook-static/**",
    ".storybook/**"
  ]
}
```

The ignore patterns belong in your own file: Oxlint reads patterns in an extended config relative to
that config, so shared ones wouldn't match your repo. Oxlint also skips whatever `.gitignore`
lists, `node_modules` included.

Add any opt-ins after it:

| Config                   | What it adds                                  |
| ------------------------ | --------------------------------------------- |
| `configs/a11y.json`      | jsx-a11y rules for React UI                   |
| `configs/testing.json`   | Testing Library rules on test and story files |
| `configs/storybook.json` | Storybook rules on story files                |
| `configs/typedoc.json`   | TypeDoc rules for documented public APIs      |

A React project should also tell the React rules its version:

```json
{
  "extends": [
    "./node_modules/@bugs5382/node-oxlint-config/configs/base.json",
    "./node_modules/@bugs5382/node-oxlint-config/configs/a11y.json"
  ],
  "settings": { "react": { "version": "19.2" } }
}
```

Your own `rules`, `overrides` and `ignorePatterns` go in the same file and win over the shared ones.

### Formatting

Create `oxfmt.config.ts`:

```ts
export { default } from "@bugs5382/node-oxlint-config/oxfmt";
```

To change a setting, spread the shared one:

```ts
import shared from "@bugs5382/node-oxlint-config/oxfmt";

export default { ...shared, printWidth: 100 };
```

The shared settings leave alone the files the project-template governance sync owns (`.github/`,
`.claude/`, `.gitleaks.toml`, the Taskfile) and the generated `CHANGELOG.md`.

### Scripts

```json
{
  "scripts": {
    "format": "oxfmt",
    "format:check": "oxfmt --check",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix"
  }
}
```

## 🔁 Moving from the ESLint config

This package replaces the ESLint config, published as `@the-rabbit-hole/eslint-config`, which is
deprecated.

1. Remove ESLint, Prettier and the old config:

   ```bash
   npm uninstall eslint prettier @the-rabbit-hole/eslint-config
   ```

2. Install this package and the Oxc tools (see Installation).
3. Delete `eslint.config.*` and any Prettier config, and add `.oxlintrc.json` and
   `oxfmt.config.ts` as above. Each opt-in you passed to `createESLintConfig({ enable })` becomes an
   extra entry in `extends`.
4. Swap `eslint` for `oxlint` and `prettier` for `oxfmt` in your scripts and CI.
5. Change `// eslint-disable` comments to `// oxlint-disable` (Oxlint reads both, so this can wait).

## 🧩 What's included?

- **Base:** ESLint core, TypeScript, React, Unicorn, Import and
  perfectionist's alphabetical sorting.
- **House rules:** named exports only (config, story and `.d.ts` files are exempt), no
  `../../../` imports (use a path alias), and arrow functions over function declarations.
- **Licence headers** stay with [golic](https://github.com/Bugs5382/golic), which every repo runs
  through its Taskfile.

[RULES.md](RULES.md) lists every rule that runs through an ESLint plugin, and why.

## 🤝 Contributing

Issues and pull requests are welcome. `npm test` lints a small fixture repo with every config, and
checks oxfmt against Prettier's output.

## 📜 License

MIT © Shane
