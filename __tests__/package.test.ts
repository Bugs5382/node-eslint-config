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
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

// Guards what the published tarball holds: every config a repo extends, the
// formatter settings with their types, and nothing from the repo's own tooling.

type PackResult = { files: { path: string }[] };

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

describe("npm package contents", () => {
  let packed: string[] = [];

  beforeAll(() => {
    const output = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    packed = (JSON.parse(output) as PackResult[])[0].files.map(
      (file) => file.path,
    );
  }, 60_000);

  it("ships every config in configs/", () => {
    const configs = readdirSync(path.join(repoRoot, "configs")).map(
      (file) => `configs/${file}`,
    );
    expect(packed).toEqual(expect.arrayContaining(configs));
  });

  it("ships the README, licence and manifest and nothing else", () => {
    expect(
      packed.filter((file) => !file.startsWith("configs/")).toSorted(),
    ).toEqual(["LICENSE", "README.md", "package.json"]);
  });
});
