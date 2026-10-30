export const maxPosterBytes = 10 * 1024 * 1024;
export function posterFileError(file: { size: number; type: string }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.";
  if (file.size === 0) return "Tệp ảnh trống. Vui lòng chọn ảnh khác.";
  if (file.size > maxPosterBytes) return "Ảnh không được vượt quá 10 MB.";
  return null;
}
