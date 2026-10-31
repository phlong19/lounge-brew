import { Mark } from "@tiptap/react";
import { normalizeTextColor } from "@/lib/content/text-color";

/** User-approved colour-only exception; never serialize any other style. */
export const RichTextColor = Mark.create({
  name: "textColor",
  addAttributes() { return { color: { default: null, parseHTML: element => normalizeTextColor(element.getAttribute("data-text-color") || element.getAttribute("data-color")), renderHTML: () => ({}) } }; },
  parseHTML() { return ["span[data-text-color]", "span[data-color]"].map(tag => ({ tag, getAttrs: (element: HTMLElement) => normalizeTextColor(element.getAttribute("data-text-color") || element.getAttribute("data-color")) ? {} : false })); },
  renderHTML({ mark }) {
    const color = normalizeTextColor(mark.attrs.color);
    return color ? ["span", { "data-text-color": color, style: `color: ${color}` }, 0] : ["span", {}, 0];
  },
});
