"use client";

import { useEffect, useRef, useState } from "react";
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
import { AdminEvents } from "@/components/admin/admin-events";
import { AdminEventDrawer } from "@/components/admin/admin-event-drawer";
import type { EditableEvent } from "@/lib/admin/event-list";
import { adminStyles as s } from "@/lib/ui/admin-styles";
import { cn } from "@/lib/utils";

export function AdminDesign({ events, initialLogin = false }: { events: EventRow[]; initialLogin?: boolean }) {
  const t = useTranslations("AdminDesign");
  const [login, setLogin] = useState(initialLogin);
  const [tab, setTab] = useState<"events" | "video">("events");
  const [items, setItems] = useState<EditableEvent[]>(events.map(e => ({ ...e })));
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const [editing, setEditing] = useState<EditableEvent | null>(null);
  const [url, setUrl] = useState<string>(homeVideo.sourceUrl);
  const [headingVi, setHeadingVi] = useState("Video quán cafe Trixie Hà Nội");
  const [headingEn, setHeadingEn] = useState("A moment at Trixie");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [video, setVideo] = useState(parseAdminVideo(homeVideo.sourceUrl));
  const [videoError, setVideoError] = useState("");
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


  if (login) return <Main lang="vi" className="grid min-h-dvh bg-[#F2F4EF] p-5 lg:grid-cols-2 lg:p-8">
    <Stack className="hidden justify-between gap-10 rounded-xl bg-[#152F28] p-8 text-[#FFFAE7] md:p-12 lg:flex"><Media src="/trixie/logo.png" alt="Trixie" width={150} height={60} fit="contain" /><Stack gap="lg"><Typography as="h2" variant="heading">{t("loginStory")}</Typography><Surface className="relative aspect-[3/2] min-h-64 w-full shrink-0 overflow-hidden rounded-md"><Media src="/trixie/drink-1.jpg" alt={t("venueImage")} fill sizes="50vw" /></Surface></Stack><Typography variant="small">165 Thái Hà · Hà Nội</Typography></Stack>
    <Stack className="mx-auto min-h-[calc(100dvh-2.5rem)] w-full max-w-md justify-center px-2 py-8 lg:min-h-0 lg:px-8"><Media src="/trixie/logo.png" alt="Trixie" width={150} height={60} fit="contain" className="mb-4 lg:hidden" /><Typography variant="small" tone="brand">Trixie · {t("workspace")}</Typography><Typography as="h1" variant="heading">{t("signIn")}</Typography><Typography tone="muted">{t("signInDescription")}</Typography><Form onSubmit={e => e.preventDefault()} className="mt-5"><Field><Label htmlFor="design-email">Email</Label><Input id="design-email" type="email" autoComplete="off" placeholder="name@example.com" /></Field><Field><Label htmlFor="design-password">{t("password")}</Label><Input id="design-password" type="password" autoComplete="off" /></Field><Button disabled className={s.primary}>{t("signIn")}</Button></Form><Typography variant="small" tone="muted">{t("authLater")}</Typography><Button variant="outline" onClick={() => setLogin(false)}>{t("viewDesign")}<Icon name="arrowRight" /></Button><AppLink href="/" className="mt-3 text-sm underline">{t("viewSite")}</AppLink></Stack>
  </Main>;
  return <Main lang="vi" className={s.root} data-admin-design>
    <Surface className={s.sidebar}><Inline className="justify-between"><Media src="/trixie/logo.png" alt="Trixie" width={124} height={50} fit="contain" /></Inline><Navigation aria-label={t("workspace")} className={s.nav}>{(["events","video"] as const).map(key => <Button key={key} variant="ghost" aria-pressed={tab === key} className={s.navButton} onClick={() => { setTab(key); setNotice(""); }}><Icon name={key === "events" ? "calendar" : "music"} />{t(key)}</Button>)}</Navigation><Stack gap="sm" className="hidden lg:mt-auto lg:flex"><AppLink href="/" target="_blank" className="inline-flex min-h-11 items-center gap-3 text-sm text-stone-600"><Icon name="externalLink" />{t("viewSite")}</AppLink></Stack></Surface>
    <Surface className={s.sheet}><Inline className={s.topbar}><Typography variant="small" tone="muted" className="hidden md:block">{t("workspace")} / <Typography as="span" variant="inline" tone="ink">{t(tab)}</Typography></Typography><Inline gap="sm"><Typography variant="small" className="rounded bg-[#F2F4EF] px-2 py-1">{t("design")}</Typography><Button variant="ghost" size="sm" onClick={() => setLogin(true)}>{t("loginScreen")}</Button></Inline></Inline>
    <Stack gap="lg" className={s.canvas}>
      <Inline className="items-start justify-between"><Stack gap="xs"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">{t(tab === "events" ? "eventsTitle" : "videoTitle")}</Typography></Stack><Button className={s.primary} disabled={!dirty || (tab === "video" && !parseAdminVideo(url))} onClick={save}><Icon name="check" />{t("savePreview")}</Button></Inline>
      {notice ? <Status className="rounded-md bg-[#EAF4ED] px-4 py-3 text-[#205B3B]">{notice}</Status> : dirty ? <Typography variant="small" tone="muted">{t("unsaved")}</Typography> : null}
      {tab === "events" ? <AdminEvents items={items} onEdit={(event, trigger) => { drawerTrigger.current = trigger; setEditing(event); }} onAdd={trigger => { drawerTrigger.current = trigger; setEditing({ id: crypto.randomUUID(), title_vi: "", title_en: "", performer_name: "", event_date: "", end_date: null, description_vi: "", description_en: "", cover_image_url: null, is_active: true, additionalFee: null }); }} /> : <Grid className="items-start gap-6 xl:grid-cols-2"><Surface className={cn(s.panel,"p-5 md:p-6")}><Stack gap="lg"><Typography as="h2" variant="subheading" className="text-lg md:text-lg">{t("videoSettings")}</Typography><Field><Label htmlFor="video-url" required>{t("videoUrl")}</Label><Input id="video-url" value={url} onChange={e=>{setUrl(e.target.value);setVideoError("");mark();}} aria-invalid={!!videoError} aria-describedby={videoError?"video-error":"video-help"} />{videoError ? <Typography id="video-error" variant="small" tone="danger">{videoError}</Typography> : <Typography id="video-help" variant="small" tone="muted">YouTube, Facebook, Vimeo, MP4 / WebM</Typography>}</Field><Grid className="items-end sm:grid-cols-2"><Field><Label htmlFor="heading-vi">{t("headingVi")}</Label><Input id="heading-vi" value={headingVi} onChange={e=>{setHeadingVi(e.target.value);mark();}} /></Field><Field><Label htmlFor="heading-en" optionalLabel={t("optional")}>{t("headingEn")}</Label><Input id="heading-en" value={headingEn} onChange={e=>{setHeadingEn(e.target.value);mark();}} /></Field></Grid><CheckboxField label={t("enableVideo")} checked={videoEnabled} onChange={e=>{setVideoEnabled(e.target.checked);mark();}} /></Stack></Surface><Stack gap="md"><Inline className="justify-between"><Typography as="h2" variant="body" className="font-semibold">{t("preview")}</Typography><Typography variant="small" tone="muted">{video?.provider} · 16:9</Typography></Inline><Typography as="h3" variant="subheading">{headingVi}</Typography>{videoEnabled && video ? <AdminVideoPlayer video={video} title={headingVi || "Video Trixie"} /> : <Surface className={cn(s.player,"flex items-center justify-center text-white")}><Typography>{t("videoHidden")}</Typography></Surface>}<Typography variant="small" tone="muted">{t("frameNote")}</Typography></Stack></Grid>}
    </Stack></Surface>
    <AdminEventDrawer onReturnFocus={() => { if (drawerTrigger.current?.isConnected) drawerTrigger.current.focus({ preventScroll: true }); else document.getElementById("event-search")?.focus(); }} event={editing} isNew={!items.some(item => item.id === editing?.id)} onChange={setEditing} onClose={() => setEditing(null)} onApply={event => { setItems(rows => rows.some(item => item.id === event.id) ? rows.map(item => item.id === event.id ? event : item) : [...rows, event]); mark(); setEditing(null); }} />
  </Main>;
}
