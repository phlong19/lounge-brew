import { test } from "node:test";
import assert from "node:assert/strict";
import { maxPosterBytes, posterFileError } from "../../src/lib/admin/poster.ts";
test("poster validation accepts supported formats up to the size limit", () => {
 for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(posterFileError({ type, size: maxPosterBytes }), null);
});
test("poster validation rejects unsupported formats, empty files and oversized images", () => {
 assert.match(posterFileError({ type: "image/svg+xml", size: 100 }), /JPG/);
 assert.match(posterFileError({ type: "text/plain", size: 100 }), /JPG/);
 assert.match(posterFileError({ type: "image/png", size: 0 }), /trống/);
 assert.match(posterFileError({ type: "image/jpeg", size: maxPosterBytes + 1 }), /10 MB/);
});
