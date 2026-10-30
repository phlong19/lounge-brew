export type ReservationValues = {
  event: string;
  email: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
};
export type ReservationField = keyof ReservationValues;
export type ReservationErrors = Partial<Record<ReservationField, string>>;

export function venueNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}

export type ReservationEventTime = { id: string; date: string; time?: string; startsAt?: string };
export function isUpcomingChoice(event: ReservationEventTime, now = new Date()) {
  const start = event.startsAt || (event.time ? `${event.date}T${event.time}:00+07:00` : null);
  return start ? Number.isFinite(Date.parse(start)) && Date.parse(start) > now.getTime() : event.date >= venueNow(now).date;
}

export function validateReservation(values: ReservationValues, now = new Date(), events: readonly ReservationEventTime[] = []): ReservationErrors {
  const errors: ReservationErrors = {};
  const current = venueNow(now);
  const email = values.email?.trim() ?? "";
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = "emailInvalid";
  const selectedEvent = values.event ? events.find(event => event.id === values.event) : undefined;
  if (values.event && (!selectedEvent || !isUpcomingChoice(selectedEvent, now))) errors.event = "eventInvalid";
  if (!values.name.trim()) errors.name = "nameRequired";
  else if (values.name.trim().length > 120) errors.name = "nameLong";
  const digits = values.phone.replace(/\D/g, "");
  if (!/^[+\d\s().-]+$/.test(values.phone) || digits.length < 7 || digits.length > 15) errors.phone = "phoneInvalid";
  const parsedDate = new Date(`${values.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== values.date) errors.date = "dateRequired";
  else if (values.date < current.date) errors.date = "datePast";
  if (selectedEvent && !errors.date && values.date !== selectedEvent.date) errors.date = "eventDateMismatch";
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(values.time)) errors.time = "timeRequired";
  else if (values.time < "07:00" || values.time > "23:00") errors.time = "timeHours";
  else if (values.date === current.date && values.time <= current.time) errors.time = "timePast";
  if (!/^\d+$/.test(values.guests) || !Number.isSafeInteger(Number(values.guests)) || Number(values.guests) < 1) errors.guests = "guestsInvalid";
  if (values.notes.length > 1000) errors.notes = "notesLong";
  return errors;
}
