import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url);
const Module = require("node:module");
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return original.call(
    this,
    request.startsWith("@/") ? resolve("src", request.slice(2)) : request,
    ...args,
  );
};
for (const extension of [".ts", ".tsx"])
  require.extensions[extension] = (module, filename) =>
    module._compile(
      ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      }).outputText,
      filename,
    );
const { RichText } = require("../../src/components/content/rich-text.tsx");
const render = (content) =>
  renderToStaticMarkup(React.createElement(RichText, { content }));
test("articles keep paragraphs, accents, headings, emphasis and ordered lists through primitives", () => {
  const result = render(
    "<p>Hẹn ở <strong>Trixie</strong> &amp; Thái Hà.</p><h2>Đêm nhạc</h2><ol><li>Đặt bàn</li></ol>",
  );
  assert.match(result, /<p[^>]*>Hẹn ở <strong/);
  assert.match(result, /&amp; Thái Hà/);
  assert.match(result, /<h2[^>]*>Đêm nhạc/);
  assert.match(result, /<ol[^>]*><li/);
});
test("scripts, style, unsafe links and event-handler attributes never enter rendered content", () => {
  const result = render(
    '<script>alert(1)</script><style>body{color:red}</style><p style="color:red" onclick="alert(1)">Safe</p><a href="javascript:alert(1)">Readable</a><iframe src="https://example.com">bad embed</iframe>',
  );
  assert.match(result, /Safe/);
  assert.match(result, /Readable/);
  assert.doesNotMatch(
    result,
    /<script|<style|<iframe|onclick|style=|javascript:|alert\(1\)|bad embed/,
  );
});
test("safe links retain their readable destination and text", () => {
  const result = render('<a href="https://trixie.com.vn/">Trixie</a>');
  assert.match(result, /href="https:\/\/trixie.com.vn\/"/);
  assert.match(result, />Trixie<\/a>/);
});
test("article images retain safe source, alternative text and dimensions through Media", () => {
  const result = render(
    '<p><img src="/trixie/venue-1.jpg" alt="Cà phê Trixie" width="1000" height="750" onerror="alert(1)" style="display:none"></p>',
  );
  assert.match(result, /<img[^>]*alt="Cà phê Trixie"/);
  assert.match(result, /width="1000" height="750"/);
  assert.doesNotMatch(result, /onerror|display:none|alert\(1\)/);
});
