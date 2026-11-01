import {test} from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {pathToFileURL} from "node:url";
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith("@/")?pathToFileURL(process.cwd()+"/src/"+specifier.slice(2)+".ts").href:specifier,context);}});
const {reservationInput}=await import("../../src/lib/reservations/input.ts");
const {normalizePhone,reservationTransitions}=await import("../../src/lib/reservations/model.ts");
const {canAccessAdmin,canManageEvents}=await import("../../src/lib/admin/roles.ts");
const {validateReservation}=await import("../../src/lib/reservations/validation.ts");
const valid={idempotencyKey:"30000000-0000-4000-8000-000000000001",name:"  Nguyễn An  ",phone:"0977165165",date:"2026-11-07",time:"20:15",guests:"2"};
test("public request whitelists fields and never accepts status, source or actor spoofing",()=>{
 const parsed=reservationInput(valid);assert.equal(parsed.values.name,"Nguyễn An");assert.equal(parsed.values.email,"");assert.equal(parsed.status,"pending");assert.equal(parsed.source,"website");
 for(const input of [{...valid,status:"confirmed"},{...valid,source:"phone"},{...valid,updated_by:"actor"},{...valid,website:"bot"},{...valid,idempotencyKey:"bad"},{...valid,phone:123},{...valid,name:"Bad\nName"}])assert.throws(()=>reservationInput(input));
 assert.equal(reservationInput({...valid,source:"zalo",status:"confirmed"},true).source,"zalo");
 assert.throws(()=>reservationInput({...valid,status:"cancelled"},true));
});
test("phone canonicalization agrees across local and international formats",()=>{
 for(const phone of ["0977 165 165","+84 977165165","0084 977165165","+84 (0)977165165"])assert.equal(normalizePhone(phone),"84977165165");
});
test("booking staff can handle requests without gaining content rights",()=>{
 assert.equal(canAccessAdmin({role:"booking",is_active:true}),true);assert.equal(canManageEvents({role:"booking",is_active:true}),false);
 assert.equal(canAccessAdmin({role:"booking",is_active:false}),false);assert.equal(canAccessAdmin({role:"visitor",is_active:true}),false);
});
test("confirmation is a staff transition, and closed requests reopen through pending",()=>{
 assert(reservationTransitions("pending").includes("confirmed"));assert.deepEqual(reservationTransitions("confirmed"),["cancelled"]);
 for(const status of ["declined","cancelled","unreachable"])assert.deepEqual(reservationTransitions(status),["pending"]);
});
test("public retry validation defers changing availability to the atomic receipt transaction, but keeps syntax and bounds",()=>{
 const now=new Date("2026-11-08T00:00:00+07:00"),values={event:"show",email:"",notes:"",...valid},events=[{id:"show",date:"2026-11-07",startsAt:"2026-11-07T20:15:00+07:00"}];
 assert.equal(validateReservation(values,now,events).event,"eventInvalid");assert.deepEqual(validateReservation(values,now,events,{deferVisitChecks:true}),{});
 assert.equal(validateReservation({...values,date:"2026-02-30"},now,events,{deferVisitChecks:true}).date,"dateRequired");
 assert.equal(validateReservation({...values,time:"23:01"},now,events,{deferVisitChecks:true}).time,"timeHours");
 assert.equal(validateReservation({...values,guests:"2147483648"},now,events,{deferVisitChecks:true}).guests,"guestsInvalid");
});
