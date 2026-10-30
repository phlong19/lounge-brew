"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field, Form, Input, Label, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Grid, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { isUpcomingChoice, validateReservation, type ReservationErrors, type ReservationField, type ReservationValues } from "@/lib/reservations/validation";

export type EventChoice = { id: string; label: string; date: string; time: string; startsAt?: string };
const initialValues: ReservationValues = { event:"",name:"",phone:"",email:"",date:"",time:"",guests:"2",notes:"" };
const order: ReservationField[] = ["event","name","phone","email","date","time","guests","notes"];

export function ReservationForm({ today, events = [], initialEventId }: { today: string; events?: EventChoice[]; initialEventId?: string }) {
  const t = useTranslations("Reservation");
  const prefix = useId();
  const [clock, setClock] = useState<Date | null>(null);
  const availableEvents = clock ? events.filter(event => isUpcomingChoice(event, clock)) : events;
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState(() => {
    const choice = events.find(event => event.id === initialEventId);
    return { ...initialValues, ...(choice ? { event: choice.id, date: choice.date, time: choice.time } : {}) };
  });
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [reviewed, setReviewed] = useState(false);
  const summary = useRef<HTMLElement | null>(null);
  const review = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => { setReady(true); setClock(new Date()); const timer = window.setInterval(() => setClock(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const id = (field: ReservationField) => `${prefix}-${field}`;
  const validate = () => validateReservation(values, new Date(), events);
  function change(field: ReservationField, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }));
  }
  function selectEvent(value: string) {
    const choice = availableEvents.find(event => event.id === value);
    setValues(current => ({ ...current,event:choice?.id ?? "",...(choice ? {date:choice.date,time:choice.time} : {}) }));
    setErrors(current => ({ ...current,event:undefined,date:undefined,time:undefined }));
  }
  function blur(field: ReservationField) { setErrors(current => ({ ...current,[field]:validate()[field] })); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();setErrors(next);
    if (Object.keys(next).length) requestAnimationFrame(() => summary.current?.focus());
    else { setReviewed(true);requestAnimationFrame(() => review.current?.focus()); }
  }
  const message = (field: ReservationField) => errors[field] ? <Typography id={`${id(field)}-error`} variant="small" tone="danger">{t(errors[field]!)}</Typography> : null;
  const invalid = order.filter(field => errors[field]);
  const summaryValue = (field: ReservationField) => field === "event" ? events.find(event => event.id === values.event)?.label ?? t("generalVisit") : values[field].trim() || t("notProvided");
  return <Surface id="reservation" tone="paper">
    <Stack gap="lg">
      {reviewed ? <Stack gap="lg">
        <Typography ref={review} tabIndex={-1} variant="lead" className="outline-none">{t("reviewTitle")}</Typography>
        <Grid className="gap-5 sm:grid-cols-2">{order.filter(field => field !== "notes").map(field => <Stack key={field} gap="xs"><Typography variant="small" tone="muted">{t(field)}</Typography><Typography className="break-words">{summaryValue(field)}</Typography></Stack>)}</Grid>
        {values.notes.trim() ? <Stack gap="xs"><Typography variant="small" tone="muted">{t("notes")}</Typography><Typography className="whitespace-pre-wrap break-words">{values.notes.trim()}</Typography></Stack> : null}
        <Button variant="outline" className="w-fit" onClick={() => {setReviewed(false);requestAnimationFrame(() => document.getElementById(id("event"))?.focus());}}>{t("edit")}</Button>
      </Stack> : <Form noValidate onSubmit={submit} aria-label={t("title")}>
        {invalid.length ? <Surface ref={summary} role="alert" tabIndex={-1} aria-labelledby={`${prefix}-error-title`} className="bg-red-50 p-4 text-red-900 outline-none focus-visible:outline-2"><Typography id={`${prefix}-error-title`} variant="caption">{t("errorTitle")}</Typography><Stack gap="xs" className="mt-2">{invalid.map(field => <AppLink key={field} href={`#${id(field)}`} className="text-sm underline" onClick={event => {event.preventDefault();document.getElementById(id(field))?.focus();}}>{t(errors[field]!)}</AppLink>)}</Stack></Surface> : null}
        <Field data-source-field="event"><Label htmlFor={id("event")} optionalLabel={t("optional")}>{t("event")}</Label><Select name="event" value={values.event || "general"} onValueChange={selectEvent}><SelectTrigger id={id("event")} aria-invalid={!!errors.event} aria-describedby={errors.event ? `${id("event")}-error` : undefined} onBlur={() => blur("event")} className="min-w-0 [&>span]:truncate"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">{t("generalVisit")}</SelectItem>{availableEvents.map(event => <SelectItem key={event.id} value={event.id}>{event.label}</SelectItem>)}</SelectContent></Select>{message("event")}</Field>
        <Grid className="gap-5 sm:grid-cols-2">
          <Field data-source-field="name"><Label htmlFor={id("name")} required>{t("name")}</Label><Input id={id("name")} name="name" autoComplete="name" required maxLength={120} value={values.name} onChange={event => change("name",event.target.value)} onBlur={() => blur("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id("name")}-error` : undefined} />{message("name")}</Field>
          <Field data-source-field="phone"><Label htmlFor={id("phone")} required>{t("phone")}</Label><Input id={id("phone")} name="phone" type="tel" autoComplete="tel" required maxLength={30} value={values.phone} onChange={event => change("phone",event.target.value)} onBlur={() => blur("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id("phone")}-error` : undefined} />{message("phone")}</Field>
        </Grid>
        <Field data-source-field="email"><Label htmlFor={id("email")} optionalLabel={t("optional")}>{t("email")}</Label><Input id={id("email")} name="email" type="email" autoComplete="email" maxLength={254} value={values.email} onChange={event => change("email",event.target.value)} onBlur={() => blur("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id("email")}-error` : undefined} />{message("email")}</Field>
        <Grid className="gap-5 sm:grid-cols-2">
          <Field data-source-field="date"><Label htmlFor={id("date")} required>{t("date")}</Label><Input id={id("date")} name="date" type="date" required min={today} value={values.date} onChange={event => change("date",event.target.value)} onBlur={() => blur("date")} aria-invalid={!!errors.date} aria-describedby={errors.date ? `${id("date")}-error` : undefined} className="block min-w-0" />{message("date")}</Field>
          <Field data-source-field="time"><Label htmlFor={id("time")} required>{t("time")}</Label><Input id={id("time")} name="time" type="time" required min="07:00" max="23:00" step={900} value={values.time} onChange={event => change("time",event.target.value)} onBlur={() => blur("time")} aria-invalid={!!errors.time} aria-describedby={errors.time ? `${id("time")}-error` : `${prefix}-hours`} className="block min-w-0" />{message("time")}<Typography id={`${prefix}-hours`} variant="small" tone="muted">07:00–23:00</Typography></Field>
        </Grid>
        <Field data-source-field="guests"><Label htmlFor={id("guests")} required>{t("guests")}</Label><Input id={id("guests")} name="guests" type="number" inputMode="numeric" required min={1} step={1} value={values.guests} onChange={event => change("guests",event.target.value)} onBlur={() => blur("guests")} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? `${id("guests")}-error` : undefined} />{message("guests")}</Field>
        <Field data-source-field="notes"><Label htmlFor={id("notes")} optionalLabel={t("optional")}>{t("notes")}</Label><Textarea id={id("notes")} name="notes" rows={3} maxLength={1000} value={values.notes} onChange={event => change("notes",event.target.value)} onBlur={() => blur("notes")} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? `${id("notes")}-error` : undefined} className="min-h-24" />{message("notes")}</Field>
        <Button type="submit" disabled={!ready} size="lg" className="w-full sm:w-fit">{t("review")}<Icon name="arrowRight" /></Button>
      </Form>}
    </Stack>
  </Surface>;
}
