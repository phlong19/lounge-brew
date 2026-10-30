"use client";

import { useEffect, useRef, useState } from "react";
import { adminRequest, loadAdminEvents, saveAdminEvent } from "@/lib/admin/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Field, Form, Input, Label } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Grid, Inline, Main, Navigation, Stack, Status, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { AdminVideoPlayer, parseAdminVideo } from "@/components/admin/admin-video-player";
import { homeVideo } from "@/data/home-video";
import type { EventRow } from "@/types/domain";
import { DeleteEventDialog } from "@/components/admin/delete-event-dialog";
import { AdminEvents } from "@/components/admin/admin-events";
import { AdminEventDrawer } from "@/components/admin/admin-event-drawer";
import type { EditableEvent } from "@/lib/admin/event-list";
import { adminStyles as s } from "@/lib/ui/admin-styles";
import { cn } from "@/lib/utils";

export function AdminDesign({ events, initialLogin = false }: { events: EventRow[]; initialLogin?: boolean }) {
  const t = useTranslations("AdminDesign");
  const login = initialLogin;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError,setLoadError] = useState("");
  const [loadKey,setLoadKey] = useState(0);
  const [loading, setLoading] = useState(!initialLogin);
  const [tab, setTab] = useState<"events" | "video">("events");
  const [items, setItems] = useState<EditableEvent[]>(events.map(e => ({ ...e })));
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const [deleting, setDeleting] = useState<EditableEvent | null>(null);
  const [deleteError,setDeleteError] = useState("");
  const [editing, setEditing] = useState<EditableEvent | null>(null);
  const [url, setUrl] = useState<string>(homeVideo.sourceUrl);
  const [headingVi, setHeadingVi] = useState("Video quán cafe Trixie Hà Nội");
  const [headingEn, setHeadingEn] = useState("A moment at Trixie");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [video, setVideo] = useState(parseAdminVideo(homeVideo.sourceUrl));
  const [videoError, setVideoError] = useState("");
  useEffect(() => {
    if (login) return;
    let alive = true;
    loadAdminEvents().then(rows => { if (alive) setItems(rows); }).catch(cause => { if (alive) setLoadError(cause.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [login,loadKey]);
  async function signIn(form: HTMLFormElement) {
    const fields = new FormData(form); setBusy(true); setError("");
    try { await adminRequest("/api/admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fields.get("email"),password:fields.get("password")})}); window.location.assign("/admin"); }
    catch(cause) { setError(cause instanceof Error ? cause.message : "Không thể đăng nhập."); }
    finally { setBusy(false); }
  }
  async function persistEvent(event: EditableEvent) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const saved = await saveAdminEvent(event,!items.some(item => item.id === event.id));
      setItems(rows => rows.some(item => item.id === saved.id) ? rows.map(item => item.id === saved.id ? saved : item) : [...rows,saved]);
      setEditing(null); setNotice("Đã lưu sự kiện.");
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu sự kiện."); }
    finally { setBusy(false); }
  }
  async function removeEvent() {
    if (!deleting || busy) return;
    setBusy(true); setDeleteError("");
    try { await adminRequest(`/api/admin/events/${deleting.id}`,{method:"DELETE"}); setItems(rows=>rows.filter(item=>item.id!==deleting.id)); setEditing(null); setDeleting(null); setNotice("Đã xóa sự kiện."); }
    catch(cause) { setDeleteError(cause instanceof Error ? cause.message : "Không thể xóa sự kiện."); }
    finally { setBusy(false); }
  }
  function mark() { setDirty(true); setNotice(""); }
  function previewVideo() { const next = parseAdminVideo(url); setVideoError(next ? "" : t("invalidVideo")); if (next) setVideo(next); return !!next; }
  function save() { if (tab === "video" && !previewVideo()) return; setDirty(false); setNotice(t("savedPreview")); }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = parseAdminVideo(url);
      setVideoError(next ? "" : t("invalidVideo"));
      if (next) setVideo(next);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [url, t]);


  if (login) return <Main lang="vi" className="flex min-h-dvh items-center justify-center bg-[#F2F4EF] px-5 py-10">
    <Stack gap="lg" className="w-full max-w-sm"><Media src="/trixie/logo.png" alt="Trixie" width={150} height={60} fit="contain" className="mx-auto" /><Typography as="h1" variant="heading" className="text-center">{t("signIn")}</Typography><Form onSubmit={e => { e.preventDefault(); void signIn(e.currentTarget); }} className="mt-5"><Field><Label htmlFor="design-email">Email</Label><Input id="design-email" name="email" required type="email" autoComplete="username" placeholder="name@example.com" /></Field><Field><Label htmlFor="design-password">{t("password")}</Label><Input id="design-password" name="password" required type="password" autoComplete="current-password" /></Field><Button type="submit" disabled={busy} className={s.primary}>{busy ? "Đang đăng nhập…" : t("signIn")}</Button></Form>{error ? <Typography role="alert" variant="small" tone="danger">{error}</Typography> : null}<AppLink href="/" className="text-center text-sm underline">{t("viewSite")}</AppLink></Stack>
  </Main>;

  return <Main lang="vi" className={s.root} data-admin-design>
    <Surface className={s.sidebar}><Inline className="justify-between"><Media src="/trixie/logo.png" alt="Trixie" width={124} height={50} fit="contain" /></Inline><Navigation aria-label={t("workspace")} className={s.nav}>{(["events","video"] as const).map(key => <Button key={key} variant="ghost" aria-pressed={tab === key} className={s.navButton} onClick={() => { setTab(key); setNotice(""); }}><Icon name={key === "events" ? "calendar" : "music"} />{t(key)}</Button>)}</Navigation><Stack gap="sm" className="lg:mt-auto"><Button variant="ghost" className="justify-start" onClick={async () => { await adminRequest("/api/admin/session",{method:"DELETE"}); window.location.assign("/admin"); }}>Đăng xuất</Button><AppLink href="/" target="_blank" className="inline-flex min-h-11 items-center gap-3 text-sm text-stone-600"><Icon name="externalLink" />{t("viewSite")}</AppLink></Stack></Surface>
    <Surface className={s.sheet}><Inline className={s.topbar}><Typography variant="small" tone="muted" className="hidden md:block">{t("workspace")} / <Typography as="span" variant="inline" tone="ink">{t(tab)}</Typography></Typography></Inline>
    <Stack gap="lg" className={s.canvas}>
      <Inline className="items-start justify-between"><Stack gap="xs"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">{t(tab === "events" ? "eventsTitle" : "videoTitle")}</Typography></Stack>{tab === "video" ? <Button className={s.primary} disabled={!dirty || (tab === "video" && !parseAdminVideo(url))} onClick={save}><Icon name="check" />{t("savePreview")}</Button> : null}</Inline>
      {notice ? <Status className="rounded-md bg-[#EAF4ED] px-4 py-3 text-[#205B3B]">{notice}</Status> : dirty ? <Typography variant="small" tone="muted">{t("unsaved")}</Typography> : null}
      {tab === "events" ? loading ? <Typography role="status">Đang tải sự kiện…</Typography> : loadError ? <Stack><Typography role="alert" tone="danger">{loadError}</Typography><Button variant="outline" className="w-fit" onClick={()=>{setLoading(true);setLoadError("");setLoadKey(key=>key+1);}}>Thử lại</Button></Stack> : <AdminEvents items={items} onEdit={(event, trigger) => { drawerTrigger.current = trigger; setError(""); setEditing(event); }} onAdd={trigger => { drawerTrigger.current = trigger; setError(""); setEditing({ id: crypto.randomUUID(), title_vi: "", title_en: "", performer_name: "", event_date: "", end_date: null, description_vi: "", description_en: "", cover_image_url: null, is_active: true, additionalFee: null }); }} /> : <Grid className="items-start gap-6 xl:grid-cols-2"><Surface className={cn(s.panel,"p-5 md:p-6")}><Stack gap="lg"><Typography as="h2" variant="subheading" className="text-lg md:text-lg">{t("videoSettings")}</Typography><Field><Label htmlFor="video-url" required>{t("videoUrl")}</Label><Input id="video-url" value={url} onChange={e=>{setUrl(e.target.value);setVideoError("");mark();}} aria-invalid={!!videoError} aria-describedby={videoError?"video-error":"video-help"} />{videoError ? <Typography id="video-error" variant="small" tone="danger">{videoError}</Typography> : <Typography id="video-help" variant="small" tone="muted">YouTube, Facebook, Vimeo, MP4 / WebM</Typography>}</Field><Grid className="items-end sm:grid-cols-2"><Field><Label htmlFor="heading-vi">{t("headingVi")}</Label><Input id="heading-vi" value={headingVi} onChange={e=>{setHeadingVi(e.target.value);mark();}} /></Field><Field><Label htmlFor="heading-en" optionalLabel={t("optional")}>{t("headingEn")}</Label><Input id="heading-en" value={headingEn} onChange={e=>{setHeadingEn(e.target.value);mark();}} /></Field></Grid><CheckboxField label={t("enableVideo")} checked={videoEnabled} onChange={e=>{setVideoEnabled(e.target.checked);mark();}} /></Stack></Surface><Stack gap="md"><Inline className="justify-between"><Typography as="h2" variant="body" className="font-semibold">{t("preview")}</Typography><Typography variant="small" tone="muted">{video?.provider} · 16:9</Typography></Inline><Typography as="h3" variant="subheading">{headingVi}</Typography>{videoEnabled && video ? <AdminVideoPlayer video={video} title={headingVi || "Video Trixie"} /> : <Surface className={cn(s.player,"flex items-center justify-center text-white")}><Typography>{t("videoHidden")}</Typography></Surface>}<Typography variant="small" tone="muted">{t("frameNote")}</Typography></Stack></Grid>}
    </Stack></Surface>
    <DeleteEventDialog name={deleting?.title_vi ?? null} busy={busy} error={deleteError} onClose={()=>setDeleting(null)} onConfirm={()=>void removeEvent()} />
    <AdminEventDrawer onDelete={event=>{setDeleteError("");setDeleting(event);}} saving={busy} error={error} onReturnFocus={() => { if (drawerTrigger.current?.isConnected) drawerTrigger.current.focus({ preventScroll: true }); else document.getElementById("event-search")?.focus(); }} event={editing} isNew={!items.some(item => item.id === editing?.id)} onChange={setEditing} onClose={() => { if (!busy) { setEditing(null); setError(""); } }} onApply={persistEvent} />
  </Main>;
}
