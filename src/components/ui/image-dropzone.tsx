"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useDropzone, type DropzoneInputProps } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { maxPosterBytes, posterFileError } from "@/lib/admin/poster";
import { editorStyles } from "@/lib/ui/editor-styles";
import { cn } from "@/lib/utils";

/** Blob URLs are created from validated local files and released with the preview. */
export function FileImage({ file, alt, className }: { file: File; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { const url = URL.createObjectURL(file); setSrc(url); return () => URL.revokeObjectURL(url); }, [file]);
  return src ? <Image src={src} alt={alt} width={600} height={800} unoptimized className={cn("object-contain", className)} /> : null;
}
export function ImageDropzone({ id, file, existingSrc, error, onChange, preview, compact=false }: { compact?: boolean; preview?: ReactNode; id: string; file?: File; existingSrc: string | null; error?: string; onChange: (file: File | null) => void }) {
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    disabled: busy, multiple: false, maxFiles: 1, maxSize: maxPosterBytes,
    validator: candidate => { const message = posterFileError(candidate); return message ? { code: "poster-invalid", message } : null; },
    onDropRejected: rejections => setFileError(rejections.some(item => item.errors.some(issue => issue.code === "file-too-large")) ? "Ảnh không được vượt quá 10 MB." : "Chọn một ảnh JPG, PNG hoặc WebP hợp lệ."),
    onDropAccepted: async ([accepted]) => {
      if (!accepted) return;
      setBusy(true); setFileError("");
      try { const image = await createImageBitmap(accepted); const valid = image.width > 0 && image.height > 0 && image.width * image.height <= 40000000; image.close(); if (!valid) throw new Error("invalid-image"); onChange(accepted); }
      catch { setFileError("Không đọc được ảnh. Vui lòng chọn ảnh khác."); }
      finally { setBusy(false); }
    },
  });
  // react-dropzone supplies inline hiding styles; replace them with Tailwind.
  const { style: omittedStyles, ...inputProps } = getInputProps<DropzoneInputProps>({ id: `${id}-file`, "aria-label": "Chọn ảnh chương trình" });
  void omittedStyles;
  const message = fileError || error;
  return <div className="space-y-3">
    <div {...getRootProps({ id, role: "button", "aria-label": "Ảnh chương trình: kéo thả hoặc chọn ảnh", "aria-required": true, "aria-invalid": !!message, "aria-describedby": message ? `${id}-error` : `${id}-help` })} data-drag={isDragActive} aria-busy={busy} className={cn(editorStyles.dropzone,compact&&"min-h-48 p-4",preview&&"bg-[#0C1512] p-3 data-[drag=true]:bg-[#1D3229]")}>
      <input {...inputProps} className="sr-only" />
      {preview && !file ? <div className="pointer-events-none w-full max-w-[304px] text-left">{preview}</div> : file ? <FileImage file={file} alt="Ảnh chương trình đã chọn" className={compact?"h-48 w-auto max-w-full":"h-64 w-auto max-w-full md:h-72"} /> : existingSrc ? <Media src={existingSrc} alt="Ảnh chương trình hiện tại" width={600} height={800} fit="contain" className={compact?"h-48 w-auto max-w-full":"h-64 w-auto max-w-full md:h-72"} /> : <Icon name="upload" className="size-8 text-[#2E7017]" />}
      <Typography variant="small" className={cn("font-semibold",preview?"text-[#FFFAE7]":"text-[#2E7017]")}>{busy ? "Đang kiểm tra ảnh…" : isDragActive ? "Thả ảnh vào đây" : file || existingSrc ? "Kéo thả hoặc chọn ảnh để thay thế" : "Kéo thả hoặc bấm để chọn ảnh"}</Typography>
      {file ? <Typography variant="small" className="max-w-full break-all text-stone-600">{file.name}</Typography> : null}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2"><Typography id={`${id}-help`} variant="small" tone="muted">JPG, PNG, WebP · tối đa 10 MB</Typography>{file || existingSrc ? <Button variant="destructive" size="sm" onClick={() => { onChange(null); setFileError(""); }}><Icon name="trash" className="size-4" />Xóa ảnh</Button> : null}</div>
    {message ? <Typography id={`${id}-error`} role="alert" variant="small" tone="danger">{message}</Typography> : null}
  </div>;
}
