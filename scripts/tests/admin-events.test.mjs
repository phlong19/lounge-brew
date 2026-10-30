import { test } from "node:test";
import assert from "node:assert/strict";
import { filterEvents, localDateInput, paginationPages } from "../../src/lib/admin/event-list.ts";
const item = (id, date, options = {}) => ({ id, title_vi: `Minishow ${id}`, title_en: null, performer_name: id, event_date: date, description_vi: null, description_en: null, cover_image_url: null, is_active: true, ...options });
const rows = [item("Phương Linh", "2026-10-30T13:15:00Z"), item("Lan", "2026-10-31T18:15:00Z", { is_active: false }), item("Phương Linh 2027", "2027-10-30T20:15:00+07:00", { is_active: false })];
test("event filters combine programme search, month, year and visibility", () => {
  assert.deepEqual(filterEvents(rows, { search: " MINISHOW PHƯƠNG ", scope: "visible", month: "10", year: "2026" }).map(row => row.id), ["Phương Linh"]);
  assert.deepEqual(filterEvents(rows, { search: "", scope: "hidden", month: "all", year: "all" }).map(row => row.id), ["Lan", "Phương Linh 2027"]);
});
test("month/year filtering uses Hanoi time across UTC month and year boundaries", () => {
  assert.deepEqual(filterEvents(rows, { search: "", scope: "all", month: "11", year: "2026" }).map(row => row.id), ["Lan"]);
  const boundary = item("Giao thừa", "2026-12-31T18:00:00Z");
  assert.equal(filterEvents([boundary], { search: "", scope: "all", month: "01", year: "2027" }).length, 1);
});
test("drawer dates display venue time rather than slicing UTC timestamps", () => {
  assert.equal(localDateInput("2026-10-30T13:15:00Z"), "2026-10-30T20:15");
  assert.equal(localDateInput("2026-10-30T20:15:00+07:00"), "2026-10-30T20:15");
  assert.equal(localDateInput(null), "");
});
test("pagination keeps first, current and final pages accessible without excessive links", () => {
  assert.deepEqual(paginationPages(1, 2), [1, 2]);
  assert.deepEqual(paginationPages(6, 12), [1, "gap-left", 5, 6, 7, "gap-right", 12]);
  assert.deepEqual(paginationPages(12, 12), [1, "gap-left", 9, 10, 11, 12]);
});
