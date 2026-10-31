import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(
        pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}.ts`).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

const { localizeEvents, localizeArticles } = await import(
  "../../src/lib/menu/map-menu.ts"
);
const policy = await import("../../src/lib/server/content-policy.ts");
const now = new Date("2026-10-26T21:00:00+07:00");
const event = (id, date, extra = {}) => ({
  id,
  title_vi: id,
  title_en: null,
  performer_name: id,
  event_date: date,
  description_vi: null,
  description_en: null,
  cover_image_url: null,
  is_active: true,
  ...extra,
});
const article = (id, published_at) => ({
  id,
  title_vi: id,
  title_en: null,
  slug: id,
  content_vi: id,
  content_en: null,
  thumbnail_url: null,
  published_at,
});

test("shows retain an in-progress performance and exclude ended, inactive and invalid dates", () => {
  const events = [
    event("future", "2026-10-30T20:15:00+07:00"),
    event("past", "2026-10-24T20:15:00+07:00", {
      end_date: "2026-10-24T22:00:00+07:00",
    }),
    event("current", "2026-10-26T20:15:00+07:00", {
      end_date: "2026-10-26T22:00:00+07:00",
    }),
    event("inactive", "2026-10-31T20:15:00+07:00", { is_active: false }),
    event("bad-date", "invalid"),
    event("ended-at-boundary", "2026-10-26T20:15:00+07:00", {
      end_date: now.toISOString(),
    }),
    event("past-without-end", "2026-10-26T20:15:00+07:00"),
  ];
  assert.deepEqual(
    localizeEvents("vi", events, now).map(({ id }) => id),
    ["current", "future"],
  );
});

test("localized shows retain verified end time and original source URL", () => {
  const row = event("source", "2026-10-30T20:15:00+07:00", {
    end_date: "2026-10-30T22:00:00+07:00",
    source_url: "https://trixie.com.vn/original.html",
  });
  const [localized] = localizeEvents("en", [row], now);
  assert.equal(localized.endDate, row.end_date);
  assert.equal(localized.sourceUrl, row.source_url);
});

test("articles hide drafts, invalid dates and future publications in both languages", () => {
  const articles = [
    article("older", "2026-10-20T12:00:00+07:00"),
    article("future", "2026-10-27T12:00:00+07:00"),
    article("draft", null),
    article("invalid", "not-a-date"),
    article("current", now.toISOString()),
  ];
  for (const locale of ["vi", "en"]) {
    assert.deepEqual(
      localizeArticles(locale, articles, now).map(({ id }) => id),
      ["current", "older"],
    );
  }
});

test("a failed dataset uses its snapshot without replacing another successful result", async () => {
  const [successful, failed, rejected] = await Promise.all([
    policy.resolveDataset(
      async () => ({ data: ["live"], error: null }),
      ["snapshot"],
    ),
    policy.resolveDataset(
      async () => ({ data: null, error: { message: "private details" } }),
      ["snapshot"],
    ),
    policy.resolveDataset(async () => {
      throw new Error("private details");
    }, ["snapshot"]),
  ]);
  assert.deepEqual(successful, { data: ["live"], source: "supabase" });
  assert.deepEqual(failed, { data: ["snapshot"], source: "snapshot" });
  assert.deepEqual(rejected, { data: ["snapshot"], source: "snapshot" });
});

test("successful empty lists and missing article results remain empty", async () => {
  assert.deepEqual(
    await policy.resolveDataset(
      async () => ({ data: [], error: null }),
      ["snapshot"],
    ),
    { data: [], source: "supabase" },
  );
  assert.deepEqual(
    await policy.resolveDataset(async () => ({ data: null, error: null }), {
      id: "snapshot",
    }),
    { data: null, source: "supabase" },
  );
});

test('show end status uses the verified end time with an exact ended boundary', () => {
  const row = event('show', '2026-10-26T20:15:00+07:00', {end_date: '2026-10-26T22:00:00+07:00'});
  assert.equal(policy.isEventEnded(row, now), false);
  assert.equal(policy.isEventEnded(row, new Date(row.end_date)), true);
  assert.equal(policy.isEventEnded(row, new Date('2026-10-27T00:00:00+07:00')), true);
  assert.equal(policy.isEventEnded(event('no-end', now.toISOString()), now), true);
});


test("homepage automatically selects the eight nearest future visible shows, earliest first", () => {
  const at = new Date("2026-11-01T12:00:00+07:00");
  const rows = [
    event("december", "2026-12-02T20:15:00+07:00"),
    event("november-9", "2026-11-09T20:15:00+07:00"),
    event("november-7", "2026-11-07T20:15:00+07:00"),
    event("december-8", "2026-12-08T20:15:00+07:00"),
    event("december-10", "2026-12-10T20:15:00+07:00"),
    event("december-11", "2026-12-11T20:15:00+07:00"),
    event("december-12", "2026-12-12T20:15:00+07:00"),
    event("december-13", "2026-12-13T20:15:00+07:00"),
    event("december-14", "2026-12-14T20:15:00+07:00"),
    event("hidden", "2026-11-02T20:15:00+07:00", { is_active: false }),
    event("started", at.toISOString(), { end_date: "2026-11-01T14:00:00+07:00" }),
    event("past", "2026-10-30T20:15:00+07:00"),
  ];
  const before = rows.map(row => row.id);
  assert.deepEqual(policy.homepageEvents(rows, at).map(row => row.id), ["november-7", "november-9", "december", "december-8", "december-10", "december-11", "december-12", "december-13"]);
  assert.deepEqual(rows.map(row => row.id), before);
  assert.equal(policy.bookableEvents(rows, at).length, 9);
});
test("booking automatically closes exactly at start, including shows still in progress", () => {
  const show = event("show", "2026-11-07T20:15:00+07:00", { end_date: "2026-11-07T22:00:00+07:00" });
  assert.equal(policy.isBookableEvent(show, new Date("2026-11-07T20:14:59+07:00")), true);
  assert.equal(policy.isBookableEvent(show, new Date(show.event_date)), false);
  assert.equal(policy.isBookableEvent(show, new Date("2026-11-07T21:00:00+07:00")), false);
  assert.deepEqual(policy.homepageEvents([], now), []);
});
