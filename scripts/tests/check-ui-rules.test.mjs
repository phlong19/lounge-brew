import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectSource, inspectStyles } from "../check-ui-rules.mjs";

test("features compose components with semantic props", () => {
  assert.deepEqual(
    inspectSource(
      "src/app/page.tsx",
      '<Section><Typography as="h1">Trixie</Typography></Section>',
    ),
    [],
  );
});

test("raw native tags and motion member tags are rejected in features", () => {
  for (const source of ["<div />", "<motion.article />"]) {
    assert.equal(
      inspectSource("src/app/page.tsx", source)[0].rule,
      "primitive-boundary",
    );
  }
});

test("primitives can own DOM but cannot author inline styles", () => {
  assert.deepEqual(
    inspectSource("src/components/ui/layout.tsx", "<section />"),
    [],
  );
  assert.equal(
    inspectSource(
      "src/components/ui/layout.tsx",
      '<section style={{color: "red"}} />',
    )[0].rule,
    "authored-style-or-html",
  );
  assert.equal(
    inspectSource(
      "src/components/ui/layout.tsx",
      '<style>{"body { color: red }"}</style>',
    )[0].rule,
    "authored-style-or-html",
  );
});

test("the document-shell exception does not permit nested raw feature UI", () => {
  assert.deepEqual(
    inspectSource("src/app/layout.tsx", "<html><body><Main /></body></html>"),
    [],
  );
  assert.equal(
    inspectSource("src/app/layout.tsx", "<html><body><div /></body></html>")
      .length,
    1,
  );
});

test("intrinsic factories and injected HTML cannot bypass components", () => {
  assert.equal(
    inspectSource("src/app/page.tsx", 'createElement("div", {})')[0].rule,
    "intrinsic-factory",
  );
  assert.equal(
    inspectSource(
      "src/components/ui/rich-text.tsx",
      "<Surface dangerouslySetInnerHTML={{__html: content}} />",
    )[0].rule,
    "authored-style-or-html",
  );
});

test("only the exact Tailwind entry stylesheet is accepted", () => {
  assert.deepEqual(
    inspectStyles("src/app/globals.css", '@import "tailwindcss";\n'),
    [],
  );
  assert.equal(
    inspectStyles(
      "src/app/globals.css",
      '@import "tailwindcss"; body {color:red}',
    ).length,
    1,
  );
  assert.equal(
    inspectStyles("src/components/menu.module.css", ".book {}").length,
    1,
  );
});
