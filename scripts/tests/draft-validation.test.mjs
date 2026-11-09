import {test} from 'node:test';import assert from 'node:assert/strict';import {registerHooks}from'node:module';import{pathToFileURL}from'node:url';
registerHooks({resolve(s,c,n){return n(s.startsWith('@/')?pathToFileURL(`${process.cwd()}/src/${s.slice(2)}.ts`).href:s,c)}});
const {draftPayload}=await import('../../src/lib/admin/draft-validation.ts');
test('incomplete private drafts do not invent dates or require a poster',()=>{
 const event=draftPayload('event',{title_vi:'  unfinished ',event_date:'',performer_name:'',content_vi:'<p>Hello<script>bad()</script></p>'});assert.equal(event.title_vi,'unfinished');assert.equal(event.event_date,'');assert.equal(event.cover_asset_id,null);assert.equal(event.content_vi,'<p>Hello</p>');
 const article=draftPayload('article',{title_vi:'',slug:'',content_vi:''});assert.equal(article.title_vi,'');assert.equal(article.slug,'');
});
test('draft fields cannot inject unsafe images, dates, CSS or privileged properties',()=>{
 for(const value of [{cover_image_url:'javascript:alert(1)'},{event_date:'not-a-date'},{event_date:'2026-11-10T20:15'},{ticket_palette_override:'red;display:none'},{cover_asset_id:'../x'},{additionalFee:-1},{additionalFee:1.5}])assert.throws(()=>draftPayload('event',value));
 const result=draftPayload('article',{title_vi:'Draft',created_by:'attacker',is_draft:false,published_at:'2026-11-10T00:00:00Z'});assert(!('created_by'in result));assert(!('published_at'in result));assert(!('is_draft'in result));
 for(const value of [null,[],42])assert.throws(()=>draftPayload('event',value));assert.throws(()=>draftPayload('staff',{}));
});
