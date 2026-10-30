import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const clientModule =
  "data:text/javascript," +
  encodeURIComponent(
    "export async function createSupabaseServerClient() { return globalThis.__contentTestClient(); }",
  );
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/lib/supabase/server")
      return { url: clientModule, shortCircuit: true };
    if (specifier.startsWith("@/")) {
      return nextResolve(
        pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}.ts`).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

const { getLoungeData, getArticleBySlug, getEventById } = await import(
  "../../src/lib/server/lounge-data.ts"
);
const { verifiedEvents } = await import('../../src/data/trixie-content.ts');

function configureResults(results) {
  globalThis.__contentTestClient = () => ({
    from(table) {
      const query = Promise.resolve(
        results[table] ?? { data: [], error: null },
      );
      for (const method of [
        "select",
        "order",
        "eq",
        "gte",
        "not",
        "lte",
        "maybeSingle",
        "abortSignal",
      ]) {
        query[method] = () => query;
      }
      return query;
    },
  });
}

test("missing database configuration uses verified content and never mock prices", async () => {
  globalThis.__contentTestClient = () => null;
  const data = await getLoungeData();
  assert.deepEqual(data.categories, []);
  assert.deepEqual(data.menuItems, []);
  assert.equal(data.usingMockData, false);
  assert.equal(data.contentSource, "snapshot");
  assert.ok(
    data.events.every((event) =>
      event.source_url?.startsWith("https://trixie.com.vn/"),
    ),
  );
});

test("one database failure retains every successful dataset", async (t) => {
  const warning = t.mock.method(console, "warn", () => {});
  const category = { id: "real-category" };
  configureResults({
    categories: { data: [category], error: null },
    menu_items: { data: null, error: { message: "private" } },
  });
  const data = await getLoungeData();
  assert.deepEqual(data.categories, [category]);
  assert.deepEqual(data.menuItems, []);
  assert.deepEqual(data.events, []);
  assert.deepEqual(data.articles, []);
  assert.equal(data.contentSource, "mixed");
  assert.equal(warning.mock.callCount(), 1);
  assert.ok(!warning.mock.calls[0].arguments.join(" ").includes("private"));
});

test("an article query cannot expose a draft or a future publication", async () => {
  for (const published_at of [null, "2099-10-26T07:00:00+07:00", "invalid"]) {
    configureResults({
      articles: {
        data: { id: "hidden", slug: "hidden", published_at },
        error: null,
      },
    });
    assert.equal((await getArticleBySlug("hidden")).article, null);
  }
});

test("an authoritative missing article does not resurrect a snapshot guide", async () => {
  configureResults({ articles: { data: null, error: null } });
  const result = await getArticleBySlug("mot-ngay-o-trixie");
  assert.equal(result.article, null);
  assert.equal(result.contentSource, "supabase");
});

test("client initialization errors fall back without leaking exception contents", async (t) => {
  const warning = t.mock.method(console, "warn", () => {});
  globalThis.__contentTestClient = () => {
    throw new Error("private credentials");
  };
  assert.equal((await getLoungeData()).contentSource, "snapshot");
  assert.equal((await getArticleBySlug("unknown")).article, null);
  assert.equal(warning.mock.callCount(), 2);
  assert.ok(
    warning.mock.calls.every(
      ({ arguments: args }) => !args.join(" ").includes("private credentials"),
    ),
  );
});

test('a durable detail URL resolves an ended verified snapshot show', async () => {
  globalThis.__contentTestClient = () => null;
  const result = await getEventById('19870256');
  assert.equal(result.event?.performer_name, 'Quang Dũng');
  assert.equal(result.event?.event_date, '2026-10-23T20:15:00+07:00');
  assert.equal(result.contentSource, 'snapshot');
  assert.equal((await getEventById('unknown')).event, null);
});

test('an authoritative missing show does not resurrect its snapshot', async () => {
  configureResults({events: {data: null, error: null}});
  const result = await getEventById('19870256');
  assert.equal(result.event, null);
  assert.equal(result.contentSource, 'supabase');
});

test('configured show query failures cannot resurrect deleted snapshot events', async (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  configureResults({events: {data: null, error: {message: 'private query details'}}});
  const result = await getEventById('19870256');
  assert.equal(result.event, null);
  assert.equal(result.contentSource, 'snapshot');
  assert.equal(warning.mock.callCount(), 1);
  assert.ok(!warning.mock.calls[0].arguments.join(' ').includes('private'));
});

test('show details reject inactive or invalid dates without replacing them with a snapshot', async () => {
  const row = verifiedEvents.find(({id}) => id === '19870256');
  for (const invalid of [
    {...row, is_active: false},
    {...row, event_date: 'invalid'},
    {...row, end_date: 'invalid'},
    {...row, end_date: '2026-10-22T22:00:00+07:00'}
  ]) {
    configureResults({events: {data: invalid, error: null}});
    const result = await getEventById(row.id);
    assert.equal(result.event, null);
    assert.equal(result.contentSource, 'supabase');
  }
});

test('show details retain both future and ended performances', async () => {
  for (const row of [
    verifiedEvents.find(({id}) => id === '19870256'),
    {...verifiedEvents[0], event_date: '2099-10-23T20:15:00+07:00', end_date: '2099-10-23T22:00:00+07:00'}
  ]) {
    configureResults({events: {data: row, error: null}});
    assert.deepEqual((await getEventById(row.id)).event, row);
  }
});
