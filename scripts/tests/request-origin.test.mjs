import {test} from "node:test";
import assert from "node:assert/strict";
import {isSameOrigin} from "../../src/lib/server/request-origin.ts";
const request = (origin, host = "localhost:3000", url = "http://0.0.0.0:3000/api/admin/session") =>
  new Request(url, {headers: {...(origin === undefined ? {} : {origin}), ...(host ? {host} : {})}});
test("same-origin browser requests work through the development bind address", () => {
  assert.equal(isSameOrigin(request("http://localhost:3000")), true);
  assert.equal(isSameOrigin(request("http://127.0.0.1:3000", "127.0.0.1:3000")), true);
  assert.equal(isSameOrigin(request("https://trixie.test", "trixie.test", "https://internal/api")), true);
  assert.equal(isSameOrigin(request(undefined)), true);
  assert.equal(isSameOrigin(request("http://localhost:3000", null, "http://localhost:3000/api")), true);
});
test("cross-origin, wrong port, wrong protocol and malformed origins remain blocked", () => {
  for (const origin of ["https://evil.test", "http://localhost:3001", "https://localhost:3000", "null", "bad", "http://localhost:3000/path", "http://localhost:3000.evil.test"])
    assert.equal(isSameOrigin(request(origin)), false, origin);
  const forwarded = request("https://evil.test");
  forwarded.headers.set("x-forwarded-host", "evil.test");
  assert.equal(isSameOrigin(forwarded), false);
});

test("cross-site Fetch Metadata cannot bypass origin checks by omitting Origin",()=>{
 const req=request(undefined);req.headers.set("sec-fetch-site","cross-site");assert.equal(isSameOrigin(req),false);
});
