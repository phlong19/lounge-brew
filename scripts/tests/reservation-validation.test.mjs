import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReservation, venueNow } from "../../src/lib/reservations/validation.ts";

const now = new Date("2026-10-26T10:30:00+07:00");
const valid = { event: "", email: "", name: "Nguyễn Minh", phone: "+84 977 165 165", date: "2026-10-27", time: "20:15", guests: "2", notes: "A quiet corner, please." };

test("reservation accepts accented names and a future visit without claiming availability", () => {
  assert.deepEqual(validateReservation(valid, now), {});
});
test("reservation dates use the venue timezone at the UTC day boundary", () => {
  assert.deepEqual(venueNow(new Date("2026-10-26T18:30:00Z")), { date: "2026-10-27", time: "01:30" });
});
test("reservation rejects blank required values and invalid phone text", () => {
  const errors = validateReservation({ ...valid, name: " ", phone: "abcdefg", date: "", time: "", guests: "" }, now);
  assert.deepEqual(Object.keys(errors), ["name", "phone", "date", "time", "guests"]);
});
test("reservation rejects impossible and past calendar dates", () => {
  for (const date of ["2026-02-30", "not-a-date", "2026-13-01"]) assert.equal(validateReservation({ ...valid, date }, now).date, "dateRequired");
  assert.equal(validateReservation({ ...valid, date: "2026-10-25" }, now).date, "datePast");
});
test("reservation checks opening hours and past times today", () => {
  for (const time of ["06:59", "23:01"]) assert.equal(validateReservation({ ...valid, time }, now).time, "timeHours");
  for (const time of ["25:00", "07:99", ""]) assert.equal(validateReservation({ ...valid, time }, now).time, "timeRequired");
  assert.equal(validateReservation({ ...valid, date: "2026-10-26", time: "10:30" }, now).time, "timePast");
  assert.equal(validateReservation({ ...valid, date: "2026-10-26", time: "10:45" }, now).time, undefined);
});
test("reservation rejects fractional or unsafe guest counts and oversized notes", () => {
  for (const guests of ["0", "-1", "1.5", "1e2", "9007199254740993"]) assert.equal(validateReservation({ ...valid, guests }, now).guests, "guestsInvalid");
  assert.equal(validateReservation({ ...valid, notes: "a".repeat(1001) }, now).notes, "notesLong");
});

test("reservation validates optional email and selected programme identity/date", () => {
  const events = [{ id: "verified-show", date: "2026-10-27" }];
  assert.deepEqual(validateReservation({...valid, email:"minh@example.com", event:"verified-show"}, now, events), {});
  for (const email of ["bad", "a@b", "a b@example.com", "a@b@c.com"]) assert.equal(validateReservation({...valid,email},now).email,"emailInvalid");
  assert.equal(validateReservation({...valid,event:"stale"},now,events).event,"eventInvalid");
  assert.equal(validateReservation({...valid,event:"verified-show",date:"2026-10-28"},now,events).date,"eventDateMismatch");
});


test("an event that starts while the booking form is open is no longer selectable", async () => {
  const { isUpcomingChoice } = await import("../../src/lib/reservations/validation.ts");
  const choice = { id: "live", date: "2026-11-07", time: "20:15", startsAt: "2026-11-07T20:15:30+07:00" };
  assert.equal(isUpcomingChoice(choice, new Date("2026-11-07T20:15:29+07:00")), true);
  assert.equal(isUpcomingChoice(choice, new Date("2026-11-07T20:15:30+07:00")), false);
  assert.equal(isUpcomingChoice({ ...choice, startsAt: "invalid" }, new Date("2026-11-07T20:00:00+07:00")), false);
});
