import { parseDocument } from "htmlparser2";
import type { ReactNode } from "react";

import { List, ListItem, Stack } from "@/components/ui/layout";
import { Media } from "@/components/ui/media";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { richTextColorStyles, inverseRichTextColorStyles } from "@/lib/ui/styles";
import { safeHref } from "@/lib/ui/href";

type ContentNode = ReturnType<typeof parseDocument>["children"][number];
const blocked = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "svg",
  "math",
  "template",
]);
const heading = new Set(["h2", "h3", "h4", "h5", "h6"]);

/** Parse stored content into owned components; never forward source attributes. */
export function RichText({ content, tone = "ink" }: { content: string; tone?: "ink" | "inverse" }) {
  const colors = tone === "inverse" ? inverseRichTextColorStyles : richTextColorStyles;
  function render(node: ContentNode, key: number): ReactNode {
    if (node.type === "text") return node.data;
    if (node.type !== "tag" || blocked.has(node.name)) return null;
    const children = node.children.map(render);
    if (node.name === "img" && node.attribs.src) {
      const dimension = (value: string | undefined, fallback: number) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0 && parsed <= 10000
          ? parsed
          : fallback;
      };
      return (
        <Media
          key={key}
          src={node.attribs.src}
          alt={node.attribs.alt ?? ""}
          width={dimension(node.attribs.width, 1200)}
          height={dimension(node.attribs.height, 800)}
          sizes="(min-width: 768px) 720px, 100vw"
          fit="contain"
          className="my-6 h-auto w-full"
        />
      );
    }
    if (node.name === "span") {
      const sourceColor = node.attribs["data-color"] ?? node.attribs.style?.match(/(?:^|;)\s*color\s*:\s*(#[a-f\d]{3,6}|[a-z]+)\s*(?:;|$)/i)?.[1];
      const colorClass = sourceColor ? colors[sourceColor.trim().toLowerCase()] : undefined;
      return colorClass ? <Typography key={key} as="span" variant="inline" className={colorClass}>{children}</Typography> : children;
    }
    if (node.name === "p") return <Typography key={key}>{children}</Typography>;
    if (node.name === "h1" || heading.has(node.name))
      return (
        <Typography
          key={key}
          as={
            node.name === "h1"
              ? "h2"
              : (node.name as "h2" | "h3" | "h4" | "h5" | "h6")
          }
          variant="subheading"
          className="pt-6"
        >
          {children}
        </Typography>
      );
    if (node.name === "strong" || node.name === "b")
      return (
        <Typography
          key={key}
          as="strong"
          variant="inline"
          className="font-semibold"
        >
          {children}
        </Typography>
      );
    if (node.name === "em" || node.name === "i")
      return (
        <Typography key={key} as="em" variant="inline">
          {children}
        </Typography>
      );
    if (node.name === "blockquote")
      return (
        <Typography
          key={key}
          as="blockquote"
          variant="lead"
          className="my-4 pl-5"
        >
          {children}
        </Typography>
      );
    if (node.name === "ul")
      return (
        <List key={key} className="list-disc space-y-2 pl-6">
          {children}
        </List>
      );
    if (node.name === "ol")
      return (
        <List key={key} ordered className="list-decimal space-y-2 pl-6">
          {children}
        </List>
      );
    if (node.name === "li")
      return (
        <ListItem key={key} className="leading-relaxed">
          {children}
        </ListItem>
      );
    if (node.name === "a") {
      const href = node.attribs.href;
      return href && safeHref(href) ? (
        <AppLink key={key} href={href} className="underline">
          {children}
        </AppLink>
      ) : (
        children
      );
    }
    if (node.name === "br") return " ";
    // Unsupported containers retain readable text without inheriting source markup.
    return children;
  }
  return <Stack gap="lg">{parseDocument(content).children.map(render)}</Stack>;
}
