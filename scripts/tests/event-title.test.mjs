import {test} from "node:test";
import assert from "node:assert/strict";
import {eventHeadingTitle} from "../../src/lib/events/title.ts";
test("event heading presentation lowers imported capitals before capitalizing Vietnamese words",()=>{
 const original="THỨ SÁU [30.10.2026] MINISHOW PHƯƠNG LINH";
 assert.equal(eventHeadingTitle(original),"Thứ Sáu [30.10.2026] Minishow Phương Linh");
 assert.equal(original,"THỨ SÁU [30.10.2026] MINISHOW PHƯƠNG LINH");
 assert.equal(eventHeadingTitle("[20.11.2026] MINISHOW NGUYÊN HÀ"),"[20.11.2026] Minishow Nguyên Hà");
 assert.equal(eventHeadingTitle("MINISHOW: (ĐỖ HOÀNG HIỆP) – HÀ NỘI"),"Minishow: (Đỗ Hoàng Hiệp) – Hà Nội");
});
test("heading case preserves dates, accents and punctuation in both languages",()=>{
 assert.equal(eventHeadingTitle("LIVE AT TRIXIE — MYRA TRẦN", "en"),"Live At Trixie — Myra Trần");
 assert.equal(eventHeadingTitle("PHƯƠNG LINH".normalize("NFD")),"Phương Linh");
 assert.equal(eventHeadingTitle("Thứ Sáu [30.10.2026] Minishow Phương Linh"),"Thứ Sáu [30.10.2026] Minishow Phương Linh");
 assert.equal(eventHeadingTitle(""),"");
});
