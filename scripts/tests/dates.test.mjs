import {test} from "node:test";
import assert from "node:assert/strict";
import {formatDate,isCalendarDate,maskDate,parseDisplayDate} from "../../src/lib/dates.ts";
test("all full dates display dd/MM/yyyy and timestamps resolve in Hanoi",()=>{
 assert.equal(formatDate("2026-11-07"),"07/11/2026");
 assert.equal(formatDate("2026-12-31T18:00:00Z"),"01/01/2027");
 assert.equal(formatDate("2026-11-07T20:15:00+07:00"),"07/11/2026");
 assert.equal(formatDate(""),"");assert.equal(formatDate("wrong"),"");
});
test("date entry masks display only and validates real days before producing ISO",()=>{
 assert.equal(maskDate("07112026"),"07/11/2026");assert.equal(maskDate("07-11-2026"),"07/11/2026");
 assert.equal(maskDate("2026-11-07"),"07/11/2026");assert.equal(maskDate("071"),"07/1");
 assert.equal(parseDisplayDate("07/11/2026"),"2026-11-07");
 assert.equal(parseDisplayDate("29/02/2028"),"2028-02-29");
 for(const invalid of ["29/02/2027","31/11/2026","00/12/2026","07/13/2026","7/11/2026",""])assert.equal(parseDisplayDate(invalid),"");
 assert.equal(isCalendarDate("2026-02-31"),false);assert.equal(formatDate("2026-02-31"),"");
});
