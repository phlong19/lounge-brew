import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export function inspectSource(file, source) {
  const path = file.replaceAll("\\", "/");
  const primitive = path.startsWith("src/components/ui/");
  const document = path === "src/app/layout.tsx";
  const ast = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const issues = [];
  const report = (rule, node) =>
    issues.push({
      file: path,
      line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
      rule,
    });
  const native = (name) => /^[a-z]/.test(name);
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName;
      const intrinsic = ts.isIdentifier(name) && native(name.text);
      const member =
        ts.isPropertyAccessExpression(name) && native(name.name.text);
      const shell =
        document && intrinsic && ["html", "body"].includes(name.text);
      if (!primitive && !shell && (intrinsic || member))
        report("primitive-boundary", node);
      if (intrinsic && name.text === "style")
        report("authored-style-or-html", node);
    }
    if (
      ts.isJsxAttribute(node) &&
      ["style", "dangerouslySetInnerHTML"].includes(node.name.getText(ast))
    ) {
      report("authored-style-or-html", node);
    }
    if (!primitive && ts.isCallExpression(node)) {
      const call = node.expression;
      const method = ts.isIdentifier(call)
        ? call.text
        : ts.isPropertyAccessExpression(call)
          ? call.name.text
          : "";
      const first = node.arguments[0];
      if (
        method === "createElement" &&
        first &&
        ts.isStringLiteral(first) &&
        native(first.text)
      ) {
        report("intrinsic-factory", node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return issues;
}

export function inspectStyles(file, source) {
  const path = file.replaceAll("\\", "/");
  if (
    path === "src/app/globals.css" &&
    source.trim() === '@import "tailwindcss";'
  )
    return [];
  return [{ file: path, line: 1, rule: "tailwind-import-only" }];
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "public", "docs", "dist", "out", "coverage"].includes(
        entry.name,
      )
    )
      continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile()) yield path;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const issues = [];
  for (const path of files(".")) {
    const file = relative(".", path).replaceAll("\\", "/");
    if (/\.(css|scss|sass|less)$/.test(file)) {
      issues.push(...inspectStyles(file, readFileSync(path, "utf8")));
    } else if (file.startsWith("src/") && /\.[jt]sx?$/.test(file)) {
      issues.push(...inspectSource(file, readFileSync(path, "utf8")));
    }
  }
  for (const item of issues)
    console.error(`${item.file}:${item.line} ${item.rule}`);
  console.log(`UI source rules: ${issues.length} violation(s)`);
  process.exitCode = issues.length ? 1 : 0;
}
