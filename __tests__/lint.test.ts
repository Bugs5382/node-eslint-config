/*
MIT License

Copyright (c) 2026 Shane

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Lints a small consumer repo that extends every config this package ships,
// the way a real repo would: through node_modules/@bugs5382/node-oxlint-config.
// Each fixture file breaks one rule from one plugin, so a missing plugin or a
// JS plugin that fails to load shows up as a missing rule code.

type Diagnostic = { code: string; filename: string };

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixture = path.join(repoRoot, "__tests__", "fixtures", "consumer");
const bin = (name: string) => path.join(repoRoot, "node_modules", ".bin", name);

let work = "";
let codes = new Map<string, string[]>();

beforeAll(() => {
  work = mkdtempSync(path.join(tmpdir(), "oxlint-consumer-"));
  cpSync(fixture, work, { recursive: true });
  // Stored under another name so this repo's own lint run doesn't load it.
  renameSync(
    path.join(work, "oxlintrc.fixture.json"),
    path.join(work, ".oxlintrc.json"),
  );
  const modules = path.join(work, "node_modules");
  mkdirSync(path.join(modules, "@bugs5382"), { recursive: true });
  // Only what the tarball ships, with the package's own dependencies beside it.
  const installed = path.join(modules, "@bugs5382", "node-oxlint-config");
  mkdirSync(installed);
  cpSync(path.join(repoRoot, "configs"), path.join(installed, "configs"), {
    recursive: true,
  });
  symlinkSync(
    path.join(repoRoot, "node_modules"),
    path.join(installed, "node_modules"),
  );
  let output = "";
  try {
    // No paths: the repo's own ignorePatterns and .gitignore decide what's linted.
    output = execFileSync(bin("oxlint"), ["--format", "json"], {
      cwd: work,
      encoding: "utf8",
    });
  } catch (error) {
    output = (error as { stdout: string }).stdout;
  }
  const { diagnostics } = JSON.parse(output) as { diagnostics: Diagnostic[] };
  codes = new Map();
  for (const d of diagnostics) {
    codes.set(d.filename, [...(codes.get(d.filename) ?? []), d.code]);
  }
}, 120_000);

afterAll(() => {
  if (work) rmSync(work, { force: true, recursive: true });
});

describe("a repo that extends every config", () => {
  it.each([
    ["core.ts", "eslint(func-style)"],
    ["typescript.ts", "typescript(no-explicit-any)"],
    ["unicornNative.ts", "unicorn(prefer-node-protocol)"],
    ["unicornJs.ts", "unicorn-js(no-for-loop)"],
    ["perfectionist.ts", "perfectionist(sort-objects)"],
    ["defaultExport.ts", "import(no-default-export)"],
    ["relative.ts", "eslint(no-restricted-imports)"],
    ["undocumented.ts", "typedoc(require-exported-doc-comment)"],
    ["Card.jsx", "react-js(prop-types)"],
    ["Card.jsx", "jsx-a11y(alt-text)"],
    ["Button.stories.tsx", "storybook(default-exports)"],
    ["card.test.tsx", "testing-library(prefer-screen-queries)"],
  ])("%s reports %s", (file, code) => {
    const found = [...codes]
      .filter(([name]) => path.basename(name) === file)
      .flatMap(([, list]) => list);
    expect(found).toContain(code);
  });

  it("lints only the repo's own files once it sets its ignorePatterns", () => {
    expect(
      [...codes.keys()].filter((name) => !/^(src|__tests__)\//.test(name)),
    ).toEqual([]);
  });

  it("lets config and story files use a default export", () => {
    expect(codes.get("src/Button.stories.tsx") ?? []).not.toContain(
      "import(no-default-export)",
    );
  });
});
