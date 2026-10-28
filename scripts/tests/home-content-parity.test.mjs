import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source = JSON.parse(readFileSync(new URL("../../src/data/trixie-home.json",import.meta.url)));
test("preserved homepage inventory retains all original content groups in source order",()=>{
 assert.deepEqual(source.sectionOrder,["hero","shows","introduction","food","booking","video","archive","contact"]);
 assert.deepEqual(source.introduction.map(i=>i.id),["cafe","live-music","music-lounge"]);
 assert.equal(source.products.length,21); assert.equal(source.archive.length,26);
 assert.deepEqual(source.reservationFields,["event","name","phone","email","date","time","guests","notes"]);
 for(const collection of [source.products,source.archive,source.introduction]){
  assert.equal(new Set(collection.map(i=>i.id)).size,collection.length);
  for(const [index,item] of collection.entries()){
   assert.equal(item.order,index+1);
   if(item.image.src) assert(existsSync(new URL(`../../public${item.image.src}`,import.meta.url)));
   assert(new URL(item.sourceUrl).protocol === "https:");
  }
 }
});
test("unavailable source media stays explicit without invented artist metadata",()=>{
 assert.equal(source.video.status,"private");
 const unavailable=source.archive.filter(item=>!item.image.available);
 assert.equal(unavailable.length,2);
 for(const item of unavailable){assert.equal(item.image.src,null);assert.equal(item.date,null);assert.equal(item.sourceTitle,"");}
});

test("food browsing groups retain every original dish exactly once", async () => {
 const { foodGroups } = await import("../../src/lib/lounge/food-groups.ts");
 const grouped = foodGroups.flatMap(group => [...group.productIds]);
 assert.equal(grouped.length, source.products.length);
 assert.equal(new Set(grouped).size, grouped.length);
 assert.deepEqual([...grouped].sort(), source.products.map(item => item.id).sort());
 assert(foodGroups.every(group => group.productIds.length > 0));
});
