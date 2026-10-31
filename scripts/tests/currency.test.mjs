import { test } from "node:test";
import assert from "node:assert/strict";
import { formatVndAmount, parseVndAmount } from "../../src/lib/admin/currency.ts";
test("Vietnamese currency formatting does not change the persisted integer", () => {
 assert.equal(formatVndAmount(1250000), "1.250.000");
 assert.equal(parseVndAmount("1.250.000"), 1250000);
 assert.equal(typeof parseVndAmount("1.250.000"), "number");
 assert.equal(parseVndAmount("1,250,000 ₫"), 1250000);
 assert.equal(parseVndAmount("000250000"), 250000);
});
test("fee input preserves unspecified versus zero and rejects negative or unsafe values", () => {
 assert.equal(parseVndAmount(""), null);
 assert.equal(formatVndAmount(null), "");
 assert.equal(parseVndAmount("0"), 0);
 assert.equal(formatVndAmount(0), "0");
 assert.equal(parseVndAmount("-100"), undefined);
 assert.equal(parseVndAmount("1e6"), undefined);
 assert.equal(parseVndAmount("9007199254740992"), undefined);
 assert.equal(parseVndAmount(formatVndAmount(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
});
