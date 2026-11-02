import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readMenuPage,
  visibleMenuPages,
  updateMenuUrl,
} from "../../src/lib/menu/menu-state.ts";

test("page links use safe one-based values and clamp to the available artwork", () => {
  assert.equal(readMenuPage(null, 18), 0);
  assert.equal(readMenuPage("4", 18), 3);
  assert.equal(readMenuPage("0", 18), 0);
  assert.equal(readMenuPage("999", 18), 17);
  for (const input of ["NaN", "1.5", "-1", "4x", ""])
    assert.equal(readMenuPage(input, 18), 0);
});

test("covers and spreads expose exactly the pages a guest can see", () => {
  assert.deepEqual(visibleMenuPages(0, 18, true), [0]);
  assert.deepEqual(visibleMenuPages(1, 18, true), [1, 2]);
  assert.deepEqual(visibleMenuPages(2, 18, true), [1, 2]);
  assert.deepEqual(visibleMenuPages(17, 18, true), [17]);
  assert.deepEqual(visibleMenuPages(4, 18, false), [4]);
  assert.deepEqual(visibleMenuPages(0, 0, true), []);
});

test("page links preserve other query values and anchors without adding empty page state", () => {
  assert.equal(
    updateMenuUrl("/menu?source=home#book", 3),
    "/menu?source=home&page=4#book",
  );
  assert.equal(updateMenuUrl("/menu?page=3#book", 0), "/menu#book");
});

test("grouped bookmarks retain every original page and select both pages of each paired section",async()=>{
 const {menuBookmarks}=await import("../../src/lib/menu/menu-bookmarks.ts");
 const {buildImageMenuPages}=await import("../../src/lib/menu/build-menu-pages.ts");
 const pages=buildImageMenuPages("vi"),before=JSON.stringify(pages),bookmarks=menuBookmarks(pages);
 assert.equal(bookmarks.length,10);
 for(const [id,label,indices]of [["wine","Rượu",[7,8]],["snacks","Đồ ăn nhẹ",[9,10]],["appetisers","Khai vị & salad",[11,12]],["meat","Thịt",[13,14]]]){
  const group=bookmarks.find(item=>item.id===id);assert.equal(group.label,label);assert.equal(group.page,indices[0]);assert.deepEqual(group.pages,indices);
  for(const page of indices)assert.equal(bookmarks.find(item=>item.pages.includes(page))?.id,id);
 }
 assert.deepEqual(menuBookmarks(pages,false,true).flatMap(item=>item.pages).sort((a,b)=>a-b),Array.from({length:18},(_,i)=>i));
 assert.equal(menuBookmarks(buildImageMenuPages("en"),true).find(item=>item.id==="meat").label,"Meat");
 assert.equal(JSON.stringify(pages),before);
});
