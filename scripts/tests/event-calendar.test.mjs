import {test} from "node:test";
import assert from "node:assert/strict";
import {calendarMonth,monthDays} from "../../src/lib/events/calendar.ts";
import {eventBody} from "../../src/lib/content/event-body.ts";
test("calendar month follows Hanoi time across the UTC date boundary",()=>{
 assert.deepEqual(calendarMonth("2026-10-31T18:00:00Z"),{year:2026,month:10,day:1});
});
test("month grid has six Monday-first weeks, handles leap years and marks a date once",()=>{
 const feb=monthDays(2028,1);
 assert.equal(feb.length,42);assert.equal(new Date(feb[0].key).getUTCDay(),1);
 assert.equal(feb.filter(day=>day.month===1).length,29);
 assert.equal(feb.filter(day=>day.key==="2028-02-29").length,1);
 assert.equal(monthDays(2026,10)[0].key,"2026-10-26");
});
test("remove only the synthetic pilot heading without altering original editorial headings",()=>{
 assert.equal(eventBody("<h2>Minishow Phương Linh · 30/10/2026</h2><p>Original</p>"),"<p>Original</p>");
 const source="<h2>Nguyên Hà – Giọng hát mang dấu ấn riêng</h2><p>Original</p>";
 assert.equal(eventBody(source),source);
});
