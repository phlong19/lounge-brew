"use client";
import { Embed } from "@/components/ui/embed";
import { Surface } from "@/components/ui/layout";
import { NativeVideo } from "@/components/ui/native-video";
import { adminStyles } from "@/lib/ui/admin-styles";

export function parseAdminVideo(value: string): { provider: string; src: string; native?: boolean } | null {
  try {
    const u = new URL(value); if (u.protocol !== "https:" || u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(host)) {
      const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
      return id && /^[\w-]{11}$/.test(id) ? { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (["facebook.com", "www.facebook.com"].includes(host) && (/\/videos\/\d+/.test(u.pathname) || /^\/reel\/\d+/.test(u.pathname) || u.searchParams.has("v"))) return { provider: "Facebook", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false` };
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = u.pathname.match(/(?:^|\/)(\d+)(?:\/|$)/)?.[1];
      return id ? { provider: "Vimeo", src: `https://player.vimeo.com/video/${id}${u.searchParams.has("h") ? `?h=${encodeURIComponent(u.searchParams.get("h")!)}` : ""}` } : null;
    }
    if (/\.(?:mp4|webm)$/i.test(u.pathname)) return { provider: "Video", src: u.href, native: true };
  } catch { return null; }
  return null;
}
export function AdminVideoPlayer({ video, title }: { video: NonNullable<ReturnType<typeof parseAdminVideo>>; title: string }) {
  return <Surface className={adminStyles.player}>{video.native ? <NativeVideo src={video.src} title={title} /> : <Embed src={video.src} title={title} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" className="absolute inset-0 h-full w-full" />}</Surface>;
}
