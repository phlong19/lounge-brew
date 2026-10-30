import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('@/')?pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}.ts`).href:specifier,context)}});
const {eventPayload,sanitizeEventContent}=await import('../../src/lib/admin/event-validation.ts');
const {isPublicEvent}=await import('../../src/lib/server/content-policy.ts');
const valid={title_vi:'Minishow Phương Linh',performer_name:'Phương Linh',event_date:'2026-10-30T20:15:00+07:00'};
test('event fields preserve venue time and map VND / soft delete without accepting privileged fields',()=>{
 const row=eventPayload({...valid,additionalFee:125000,isDeleted:true});assert.equal(row.event_date,'2026-10-30T13:15:00.000Z');assert.equal(row.additional_fee,125000);assert.equal(row.is_deleted,true);assert.equal(row.is_active,false);
 for(const key of ['created_by','updated_by','role','id','is_deleted'])assert.throws(()=>eventPayload({...valid,[key]:'arbitrary'}));
 assert.throws(()=>eventPayload({...valid,title_vi:' '}));assert.throws(()=>eventPayload({...valid,event_date:'2026-10-30T20:15'}));assert.throws(()=>eventPayload({...valid,end_date:'2026-10-29T20:15:00+07:00'}));
 for(const fee of [-1,1.5,Infinity,'100'])assert.throws(()=>eventPayload({...valid,additionalFee:fee}));
 assert.throws(()=>eventPayload({...valid,source_id:'../admin'}));
 assert.deepEqual(eventPayload({title_vi:'Chỉnh sửa'},true),{title_vi:'Chỉnh sửa'});
});
test('stored event content strips executable markup, unsafe images and links while preserving editorial marks',()=>{
 const cleaned=sanitizeEventContent('<p onclick="alert(1)">Xin chào <strong>Trixie</strong><script>bad()</script><iframe src="x"></iframe></p><img src="https://evil.test/x.jpg"><a href="javascript:alert(1)">bad</a><span data-text-color="#12ab34">x</span><img src="/trixie/shows/47320159.jpg" alt="Poster">');
 assert(!/onclick|script|iframe|evil|javascript/.test(cleaned));assert(cleaned.includes('<strong>Trixie</strong>'));assert(cleaned.includes('data-text-color="#12ab34"'));assert(cleaned.includes('src="/trixie/shows/47320159.jpg"'));
 assert.equal(sanitizeEventContent(cleaned),cleaned);
});
test('soft deleted shows stay non-public even if visibility remains enabled',()=>{
 const base={is_active:true,event_date:valid.event_date,end_date:'2026-10-30T22:00:00+07:00'};
 assert.equal(isPublicEvent(base),true);assert.equal(isPublicEvent({...base,is_deleted:true}),false);assert.equal(isPublicEvent({...base,is_deleted:false}),true);
});

const {canManageEvents}=await import('../../src/lib/admin/roles.ts');
test('only active editors and admins can manage events',()=>{
 for(const role of ['admin','editor'])assert.equal(canManageEvents({role,is_active:true}),true);
 for(const staff of [null,{}, {role:'booking',is_active:true},{role:'admin',is_active:false},{role:'editor',is_active:1},{role:'owner',is_active:true}])assert.equal(canManageEvents(staff),false);
});
