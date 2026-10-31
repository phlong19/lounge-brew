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

test("editorial color emphasis uses owned Tailwind classes without forwarding CSS", () => {
  const result = render('<p><span data-color="#29abe2"><strong>Buổi sáng</strong></span> <span style="color:red;position:fixed" onclick="alert(1)">Evening</span></p>');
  assert.match(result, /text-\[#00759B\]/);
  assert.match(result, /text-red-700/);
  assert.doesNotMatch(result, /style=|position:fixed|onclick|data-color=/);
});
test("unknown or executable color declarations never become rendered attributes", () => {
  const result = render('<span data-color="bg-red-500" style="color:expression(alert(1))">Readable</span>');
  assert.match(result, /Readable/);
  assert.doesNotMatch(result, /bg-red-500|expression|alert|style=/);
});

test("evening editorial colors remain readable without forwarding source styles", () => {
 const result = renderToStaticMarkup(React.createElement(RichText, {
  content: '<p><span data-color="#29abe2">Buổi tối</span></p>', tone: "inverse"
 }));
 assert.match(result, /text-\[#73D5F5\]/);
 assert.doesNotMatch(result, /style=|data-color=/);
});


test("saved underline and palette colours render through safe Tailwind primitives", () => {
 const result = render('<p><u><span data-color="purple">Nội dung sự kiện</span></u></p>');
 assert.match(result, /underline/);
 assert.match(result, /text-purple-800/);
 assert.match(result, /Nội dung sự kiện/);
 assert.doesNotMatch(result, /style=|data-color=/);
});


test("custom picker colours render only a validated colour declaration", () => {
 const result = render('<p><span data-text-color="#18af76" style="color:#18af76;position:fixed" onclick="alert(1)"><u>Màu tùy chọn</u></span></p>');
 assert.match(result, /style="color:#18af76"/);
 assert.match(result, /underline/);
 assert.doesNotMatch(result, /position|onclick|alert|data-text-color=/);
});
test("malicious and unsupported custom colour values are discarded", () => {
 for (const color of ["constructor", "__proto__", "expression(alert(1))", "#fff;background:red", "url(javascript:alert(1))"]) {
  const result = render(`<span data-text-color="${color}">Safe text</span>`);
  assert.match(result, /Safe text/);
  assert.doesNotMatch(result, /style=|onclick|background:|javascript:/);
 }
});
