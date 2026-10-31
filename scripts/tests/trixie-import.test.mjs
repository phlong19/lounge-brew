import {test} from "node:test";
import assert from "node:assert/strict";
import {listingEvents,originalArticle,normalizeSourceMarkup,titleDate,archivedSchedule} from "../lib/trixie-import.mjs";
import {parseDocument,DomUtils} from "htmlparser2";
test("listing discovery uses upcoming cards and original IDs rather than booking options or past links",()=>{
 const card=(id,status)=>'<div class="image"><a href="https://trixie.com.vn/show-E'+id+'.html"><img src="https://trixie.com.vn/media/poster.jpg"><a class="std" href="https://trixie.com.vn/show-E'+id+'.html">MINISHOW Artist</a><div class="'+status+'">Status</div></a></div>';
 assert.deepEqual(listingEvents(card(123,"enable_event")+card(456,"ended_event")).map(e=>e.source_id),["123"]);
 assert.equal(listingEvents(card(123,"enable_event")+card(456,"ended_event"),{includePast:true}).length,2);
});
test("article extraction retains exact text and images while separating nested shared seating",()=>{
 const article='<div class="pageText"><h1>Original title</h1><p>Exact <strong>words</strong><br>Next line</p><div><p>Thời gian: Từ 20h15 - 22h30. Thứ bảy, 19/12/2026</p><img src="https://trixie.com.vn/media/poster.jpg"><p><strong>Sơ đồ vị trí ngồi 2 tầng tại Trixie :</strong></p><img src="https://trixie.com.vn/media/map.jpg"></div></div><form>Not article content</form>';
 const result=originalArticle(article);
 assert.equal(result.event_date,"2026-12-19T20:15:00+07:00");
 assert.equal(result.end_date,"2026-12-19T22:30:00+07:00");
 assert.deepEqual(result.images,["https://trixie.com.vn/media/poster.jpg"]);
 assert(result.rawText.includes("Exact words"));
 assert(!result.rawText.includes("Sơ đồ"));
 assert(!result.rawText.includes("Not article"));
 const normalized=normalizeSourceMarkup(result.content);
 assert(normalized.includes("<h2>Original title</h2>"));
 assert.equal(DomUtils.textContent(parseDocument(normalized)).replace(/\s+/g," ").trim(),result.rawText);
 assert.throws(()=>originalArticle('<div class="pageText">No verified schedule</div>'));
});

test("archive dates and times are verified independently without inventing unavailable times",()=>{
 assert.equal(titleDate("MiniShow Artist 03-10-2020"),"2020-10-03");
 assert.equal(titleDate("MiniShow Artist 31-02-2020"),null);
 const result=archivedSchedule("MiniShow Artist 03-10-2020",{event_date:null,end_date:null,rawText:"Thời gian: 20h30 - 22h00 tại Trixie"});
 assert.deepEqual(result,{event_date:"2020-10-03T20:30:00+07:00",end_date:"2020-10-03T22:00:00+07:00"});
 assert.equal(archivedSchedule("MiniShow Artist 03-10-2020",{event_date:null,rawText:"Bắt đầu: 20h30"}).end_date,null);
 assert.throws(()=>archivedSchedule("MiniShow Artist 03-10-2020",{event_date:null,rawText:"No original time"}));
 assert.throws(()=>archivedSchedule("MiniShow Artist 03-10-2020",{event_date:"2020-10-04T20:30:00+07:00"}));
 const article=originalArticle('<div class="pageText"><p>Original body without a schedule</p></div>',{allowMissingSchedule:true});
 assert.equal(article.event_date,null);
 assert.equal(article.rawText,"Original body without a schedule");
});
