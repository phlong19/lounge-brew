"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { RichTextColor } from "@/components/ui/editor-colors";
import { normalizeTextColor } from "@/lib/content/text-color";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Icon, type IconName } from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { isTrustedMediaSource } from "@/lib/config/image-patterns";
import { safeHref } from "@/lib/ui/href";
import { editorStyles as s } from "@/lib/ui/editor-styles";

export function RichTextEditor({ id, value, onChange }: { id: string; value: string; onChange: (html: string) => void }) {
  const [insert, setInsert] = useState<"link" | "image" | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false, horizontalRule: false, dropcursor: false, gapcursor: false, link: { openOnClick: false, autolink: false, isAllowedUri: href => !!safeHref(href), HTMLAttributes: { class: "text-blue-700 underline" } } }), Image.configure({ allowBase64: false }), RichTextColor],
    content: value,
    immediatelyRender: false,
    injectCSS: false,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { id, role: "textbox", "aria-label": "Nội dung trang sự kiện", "aria-multiline": "true", class: s.content } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
  useEffect(() => { if (editor && (editor.isEmpty ? "" : editor.getHTML()) !== value) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  function tool(label: string, icon: IconName, action: () => void, active?: boolean, disabled = false) {
    return <Button key={label} type="button" variant="ghost" className={s.tool} aria-label={label} title={label} aria-pressed={active} disabled={!editor || disabled} onMouseDown={event => event.preventDefault()} onClick={action}><Icon name={icon} className="size-4" /></Button>;
  }
  function showInsert(mode: "link" | "image") { setInsert(mode); setUrl(mode === "link" ? editor?.getAttributes("link").href || "" : ""); setError(""); }
  function applyInsert() {
    if (!editor || !insert) return;
    const next = url.trim();
    if (insert === "image") {
      if (!isTrustedMediaSource(next)) { setError("Sử dụng liên kết ảnh từ Trixie hoặc thư viện ảnh của website."); return; }
      editor.chain().focus().setImage({ src: next, alt: "Ảnh trong nội dung sự kiện" }).run();
    } else {
      if (!safeHref(next)) { setError("Liên kết không hợp lệ."); return; }
      const chain = editor.chain().focus();
      if (editor.state.selection.empty && !editor.isActive("link")) chain.insertContent({ type: "text", text: next, marks: [{ type: "link", attrs: { href: next } }] }).run();
      else chain.extendMarkRange("link").setLink({ href: next }).run();
    }
    setInsert(null); setError("");
  }
  return <div className={s.frame} data-rich-text-editor>
    <div role="toolbar" aria-label="Định dạng nội dung" className={s.toolbar}>
      <Select value={editor?.isActive("heading", { level: 2 }) ? "h2" : editor?.isActive("heading", { level: 3 }) ? "h3" : "paragraph"} onValueChange={next => { if (!editor) return; if (next === "paragraph") editor.chain().focus().setParagraph().run(); else editor.chain().focus().setHeading({ level: next === "h2" ? 2 : 3 }).run(); }} disabled={!editor}><SelectTrigger aria-label="Kiểu đoạn văn" className="min-h-9 w-36 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paragraph">Đoạn văn</SelectItem><SelectItem value="h2">Tiêu đề 2</SelectItem><SelectItem value="h3">Tiêu đề 3</SelectItem></SelectContent></Select>
      {tool("In đậm", "bold", () => editor?.chain().focus().toggleBold().run(), editor?.isActive("bold"))}
      {tool("In nghiêng", "italic", () => editor?.chain().focus().toggleItalic().run(), editor?.isActive("italic"))}
      {tool("Gạch chân", "underline", () => editor?.chain().focus().toggleUnderline().run(), editor?.isActive("underline"))}
      <Input type="color" aria-label="Màu chữ" title="Chọn màu chữ" className="h-9 min-h-9 w-11 cursor-pointer rounded-sm border-[#15201C]/20 p-1" value={normalizeTextColor(editor?.getAttributes("textColor").color) || "#15201c"} disabled={!editor} onChange={event => { const color = normalizeTextColor(event.target.value); if (color) editor?.chain().focus().setMark("textColor", { color }).run(); }} />
      {tool("Màu chữ mặc định", "reset", () => editor?.chain().focus().unsetMark("textColor").run(), undefined, !editor?.isActive("textColor"))}

      {tool("Danh sách dấu đầu dòng", "list", () => editor?.chain().focus().toggleBulletList().run(), editor?.isActive("bulletList"))}
      {tool("Danh sách đánh số", "listOrdered", () => editor?.chain().focus().toggleOrderedList().run(), editor?.isActive("orderedList"))}
      {tool("Trích dẫn", "quote", () => editor?.chain().focus().toggleBlockquote().run(), editor?.isActive("blockquote"))}
      {tool("Chèn liên kết", "link", () => showInsert("link"), editor?.isActive("link"))}
      {editor?.isActive("link") ? tool("Bỏ liên kết", "unlink", () => editor.chain().focus().unsetLink().run()) : null}
      {tool("Chèn ảnh vào nội dung", "image", () => showInsert("image"))}
      {tool("Hoàn tác", "undo", () => editor?.chain().focus().undo().run(), undefined, !editor?.can().undo())}
      {tool("Làm lại", "redo", () => editor?.chain().focus().redo().run(), undefined, !editor?.can().redo())}
    </div>
    {insert ? <div className="space-y-2 border-b border-[#E2E6DE] bg-[#F8F9F6] p-3"><Label htmlFor={`${id}-url`}>{insert === "image" ? "Liên kết ảnh trong nội dung" : "Địa chỉ liên kết"}</Label><div className="flex flex-wrap gap-2"><Input id={`${id}-url`} className="min-w-40 flex-1" value={url} onChange={event => { setUrl(event.target.value); setError(""); }} autoFocus onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); applyInsert(); } }} /><Button variant="outline" onClick={applyInsert}>Chèn</Button><Button variant="ghost" onClick={() => setInsert(null)}>Hủy</Button></div>{error ? <Typography role="alert" variant="small" tone="danger">{error}</Typography> : null}</div> : null}
    <EditorContent editor={editor} />
  </div>;
}
