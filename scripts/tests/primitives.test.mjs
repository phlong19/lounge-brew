import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Exercise owned TSX through React without introducing a second test framework.
const require = createRequire(import.meta.url);
const Module = require("node:module");
const root = resolve(import.meta.dirname, "../..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(
    this,
    request.startsWith("@/") ? resolve(root, "src", request.slice(2)) : request,
    ...args,
  );
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    module._compile(outputText, filename);
  };
}
const { Typography } = require("../../src/components/ui/typography.tsx");
const { AppLink } = require("../../src/components/ui/link.tsx");
const { Button } = require("../../src/components/ui/button.tsx");
const { NoScript } = require("../../src/components/ui/layout.tsx");
const {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} = require("../../src/components/ui/select.tsx");
const { DialogContent } = require("../../src/components/ui/dialog.tsx");
const { SheetContent } = require("../../src/components/ui/sheet.tsx");
const h = React.createElement;
const render = (component, props, children) =>
  renderToStaticMarkup(h(component, props, children));

test("Typography keeps semantic headings, Vietnamese text, native attributes and citation", () => {
  assert.match(
    render(
      Typography,
      { as: "h1", variant: "display", id: "menu" },
      "Thực đơn Trixie",
    ),
    /^<h1[^>]*id="menu"[^>]*>Thực đơn Trixie<\/h1>$/,
  );
  assert.match(
    render(
      Typography,
      { as: "blockquote", cite: "https://trixie.com.vn" },
      "Trixie",
    ),
    /cite="https:\/\/trixie.com.vn"/,
  );
});

test("AppLink permits supported schemes and relative URLs and protects external tabs", () => {
  for (const href of [
    "/vi/menu",
    "./menu",
    "../menu",
    "?page=4",
    "#book",
    "https://trixie.com.vn",
    "http://trixie.com.vn",
    "tel:0968223399",
    "mailto:hello@example.com",
  ]) {
    assert.match(render(AppLink, { href }, "Visit"), /href=/, href);
  }
  assert.match(
    render(
      AppLink,
      { href: "https://trixie.com.vn", target: "_blank" },
      "Visit",
    ),
    /rel="noopener noreferrer"/,
  );
  assert.match(
    render(
      AppLink,
      { href: { pathname: "/vi/menu", query: { page: 4 } } },
      "Menu",
    ),
    /href="\/vi\/menu\?page=4"/,
  );
});

test("AppLink blocks executable schemes, control/encoding obfuscations and unsafe URL objects", () => {
  for (const href of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " java\nscript:alert(1)",
    "data:text/html,hello",
    "vbscript:msgbox(1)",
    "java%73cript%3Aalert(1)",
    "javascript&#58;alert(1)",
    { protocol: "javascript:", pathname: "alert(1)" },
    { pathname: "javascript:alert(1)" },
    { protocol: "data:", pathname: "text/html,hello" },
    { href: "javascript:alert(1)" },
    { pathname: "/menu", hash: "#safe", protocol: "java\tscript:" },
  ]) {
    const result = render(AppLink, { href }, "Blocked");
    assert.doesNotMatch(result, /href=/, JSON.stringify(href));
    assert.match(result, /aria-disabled="true"/, JSON.stringify(href));
  }
});

test("disabled asChild links are inert, removed from the tab order, and omit invalid disabled attributes", () => {
  let actions = 0;
  const element = Button({
    asChild: true,
    disabled: true,
    onClick: () => actions++,
    children: h(
      AppLink,
      { href: "/vi/menu", onClick: () => actions++, tabIndex: 0 },
      "Menu",
    ),
  });
  const markup = renderToStaticMarkup(element);
  assert.match(markup, /aria-disabled="true"/);
  assert.match(markup, /tabindex="-1"/);
  assert.doesNotMatch(markup, /\sdisabled=|href=/);
  const child = element.props.children;
  for (const [name, key] of [
    ["onClick", undefined],
    ["onClickCapture", undefined],
    ["onKeyDown", "Enter"],
    ["onKeyDownCapture", " "],
    ["onAuxClick", undefined],
    ["onPointerDown", undefined],
  ]) {
    let prevented = false;
    let stopped = false;
    child.props[name]({
      key,
      preventDefault: () => {
        prevented = true;
      },
      stopPropagation: () => {
        stopped = true;
      },
    });
    assert.equal(prevented, true, name);
    assert.equal(stopped, true, name);
  }
  let tabPrevented = false;
  child.props.onKeyDown({
    key: "Tab",
    preventDefault: () => {
      tabPrevented = true;
    },
    stopPropagation() {},
  });
  assert.equal(tabPrevented, false, "disabled links must not trap focus");
  assert.equal(actions, 0);
  assert.match(render(Button, { disabled: true }, "Disabled"), /disabled=""/);
  assert.match(
    render(Button, { asChild: true }, h(AppLink, { href: "/vi/menu" }, "Menu")),
    /href="\/vi\/menu"/,
  );
});

test("standalone disabled and rejected links suppress caller actions without trapping Tab", () => {
  for (const props of [
    { href: "/vi/menu", "aria-disabled": true },
    { href: "javascript:alert(1)" },
  ]) {
    let actions = 0;
    const link = AppLink({
      ...props,
      onClick: () => actions++,
      onClickCapture: () => actions++,
      onKeyDown: () => actions++,
      onKeyUp: () => actions++,
    });
    for (const [name, key] of [
      ["onClick", undefined],
      ["onClickCapture", undefined],
      ["onKeyDown", "Enter"],
      ["onKeyUp", " "],
    ]) {
      let prevented = false;
      let stopped = false;
      link.props[name]({
        key,
        preventDefault: () => {
          prevented = true;
        },
        stopPropagation: () => {
          stopped = true;
        },
      });
      assert.equal(prevented, true, name);
      assert.equal(stopped, true, name);
    }
    let tabPrevented = false;
    link.props.onKeyDown({
      key: "Tab",
      preventDefault: () => {
        tabPrevented = true;
      },
      stopPropagation() {},
    });
    assert.equal(tabPrevented, false);
    assert.equal(actions, 0);
    assert.equal(link.props.href, undefined);
  }
});

test("composed Radix wrappers reject unsupported asChild at runtime without Slot failures", () => {
  const trigger = renderToStaticMarkup(
    h(
      Select,
      { defaultValue: "menu" },
      h(
        SelectTrigger,
        { asChild: true, "aria-label": "Category" },
        h(SelectValue),
      ),
    ),
  );
  assert.match(trigger, /role="combobox"/);
  for (const [Component, props] of [
    [SelectTrigger, {}],
    [SelectContent, {}],
    [SelectItem, { value: "menu" }],
    [DialogContent, {}],
    [SheetContent, {}],
  ]) {
    const wrapped = Component({
      ...props,
      asChild: true,
      children: h("span", null, "Content"),
    });
    const findContent = (element) => {
      if (element?.props?.asChild === false) return true;
      return React.Children.toArray(element?.props?.children).some(findContent);
    };
    assert.equal(findContent(wrapped), true, Component.name);
  }
});

test("NoScript preserves no-JavaScript fallback content", () => {
  const markup = render(
    NoScript,
    null,
    h(AppLink, { href: "/menu/page-01.webp" }, "Original menu"),
  );
  assert.match(markup, /^<noscript>/);
  assert.match(markup, /href="\/menu\/page-01.webp"/);
  assert.match(markup, /Original menu<\/a><\/noscript>$/);
});

test("public types accept blockquote cite and reject unsupported asChild composition", () => {
  const file = resolve(root, "scripts/tests/__primitive_types__.tsx");
  const source = `import {Typography} from '@/components/ui/typography';
import {SelectTrigger, SelectContent, SelectItem} from '@/components/ui/select';
import {DialogContent} from '@/components/ui/dialog';
import {SheetContent} from '@/components/ui/sheet';
const quote = <Typography as="blockquote" cite="https://trixie.com.vn">Quote</Typography>;
// @ts-expect-error Composed trigger owns its children.
const trigger = <SelectTrigger asChild />;
// @ts-expect-error Composed content owns its viewport.
const content = <SelectContent asChild />;
// @ts-expect-error Composed item owns its indicator.
const item = <SelectItem value="menu" asChild />;
// @ts-expect-error Composed dialog owns its close control.
const dialog = <DialogContent asChild />;
// @ts-expect-error Composed sheet owns its close control.
const sheet = <SheetContent asChild />;`;
  const options = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    esModuleInterop: true,
    baseUrl: root,
    paths: { "@/*": ["src/*"] },
  };
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (filename, languageVersion, ...rest) =>
    filename === file
      ? ts.createSourceFile(
          file,
          source,
          languageVersion,
          true,
          ts.ScriptKind.TSX,
        )
      : originalGetSourceFile.call(host, filename, languageVersion, ...rest);
  const diagnostics = ts
    .getPreEmitDiagnostics(ts.createProgram([file], options, host))
    .filter((diagnostic) => diagnostic.file?.fileName === file);
  assert.deepEqual(
    diagnostics.map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    ),
    [],
  );
});

test("unsupported Media sources produce an inline-safe accessible fallback", () => {
  const { Media } = require("../../src/components/ui/media.tsx");
  for (const src of [
    "https://unconfigured.example/poster.jpg",
    "javascript:alert(1)",
  ]) {
    const markup = render(Media, {
      src,
      alt: "Trixie poster",
      width: 800,
      height: 1200,
    });
    assert.match(markup, /^<span /);
    assert.match(markup, /role="img"/);
    assert.match(markup, /aria-label="Trixie poster"/);
    assert.doesNotMatch(markup, /<img|<div|src=/);
  }
});
