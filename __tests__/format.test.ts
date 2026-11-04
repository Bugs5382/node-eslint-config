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
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// oxfmt with this package's settings must print what Prettier 3 printed with
// its defaults: expected.tsx was written by Prettier from input.tsx.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtures = path.join(repoRoot, "__tests__", "fixtures", "format");
const oxfmt = path.join(repoRoot, "node_modules", ".bin", "oxfmt");

const format = (file: string) =>
  execFileSync(
    oxfmt,
    [
      "-c",
      path.join(repoRoot, "configs", "oxfmt.mjs"),
      "--stdin-filepath",
      file,
    ],
    {
      encoding: "utf8",
      input: readFileSync(path.join(fixtures, file), "utf8"),
    },
  );

describe("the oxfmt settings", () => {
  it("print the same output as Prettier's defaults", () => {
    expect(format("input.tsx")).toBe(
      readFileSync(path.join(fixtures, "expected.tsx"), "utf8"),
    );
  });

  it("leave Prettier's output unchanged", () => {
    expect(format("expected.tsx")).toBe(
      readFileSync(path.join(fixtures, "expected.tsx"), "utf8"),
    );
  });
});
