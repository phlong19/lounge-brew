import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  venue,
  verifiedEvents,
  verifiedArticles,
} from "../../src/data/trixie-content.ts";
import {
  upcomingEvents,
  publishedArticles,
} from "../../src/lib/server/content-policy.ts";

test("fixed show dates and time ranges match the original title and first detail time", async () => {
  const { shows } = JSON.parse(
    await readFile(
      new URL("../../src/data/verified-shows.json", import.meta.url),
    ),
  );
  assert.equal(verifiedEvents.length, 11);
  assert.equal(new Set(verifiedEvents.map(({ id }) => id)).size, 11);
  for (const row of verifiedEvents) {
    const original = shows.find(({ id }) => id === row.id);
    const [, day, month, year] = original.title.match(
      /\[(\d+)\.(\d+)\.(\d+)\]/,
    );
    const [, startHour, startMinute, endHour, endMinute] =
      original.times[0].match(/(\d+)h(\d+)\s*(?:->|-)\s*(\d+)h(\d+)/);
    assert.equal(
      row.event_date,
      `${year}-${month}-${day}T${startHour}:${startMinute}:00+07:00`,
    );
    assert.equal(
      row.end_date,
      `${year}-${month}-${day}T${endHour}:${endMinute}:00+07:00`,
    );
    assert.equal(row.cover_image_url, original.poster);
    assert.equal(row.source_url, original.sourceUrl);
  }
});

test("the reviewed upcoming schedule begins with Phương Linh and eventually becomes empty", () => {
  const next = upcomingEvents(
    verifiedEvents,
    new Date("2026-10-26T12:00:00+07:00"),
  );
  assert.equal(next.length, 9);
  assert.equal(next[0].performer_name, "Phương Linh");
  assert.equal(next[0].event_date, "2026-10-30T20:15:00+07:00");
  assert.deepEqual(
    upcomingEvents(verifiedEvents, new Date("2027-01-01T00:00:00+07:00")),
    [],
  );
});

test("visitor guides have both languages, owned imagery and a fixed review date", () => {
  assert.equal(
    publishedArticles(verifiedArticles, new Date("2026-10-26T12:00:00+07:00"))
      .length,
    2,
  );
  assert.deepEqual(
    publishedArticles(verifiedArticles, new Date("2026-10-25T12:00:00+07:00")),
    [],
  );
  for (const row of verifiedArticles) {
    assert.ok(row.title_vi && row.title_en && row.content_vi && row.content_en);
    assert.match(row.thumbnail_url, /^\/trixie\/venue-[13]\.jpg$/);
    assert.equal(row.published_at, "2026-10-26T00:00:00+07:00");
  }
  assert.equal(venue.phoneHref, "tel:0977165165");
  assert.equal(venue.secondaryPhoneHref, "tel:0888165165");
  assert.equal(venue.hours, "07:00 — 23:00");
});
