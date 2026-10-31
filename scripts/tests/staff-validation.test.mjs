import {test} from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {pathToFileURL} from "node:url";
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith("@/")?pathToFileURL(process.cwd()+"/src/"+specifier.slice(2)+".ts").href:specifier,context);}});
const {staffInput,isStrongStaffPassword}=await import("../../src/lib/admin/staff-validation.ts");
const valid={display_name:"  Nguyễn An  ",email:" TEST@EXAMPLE.COM ",password:"StrongPass1!",role:"editor"};
test("staff creation normalizes names and email while preserving the supplied password",()=>{
 assert.deepEqual(staffInput(valid),{display_name:"Nguyễn An",email:"test@example.com",password:valid.password,role:"editor"});
 assert.equal(staffInput({...valid,role:"admin"}).role,"admin");
});
test("staff creation rejects invalid fields and caller-supplied authorization metadata",()=>{
 for(const input of [null,[],{...valid,display_name:" "},{...valid,display_name:"x".repeat(121)},{...valid,display_name:"Bad\nName"},{...valid,email:"a@@example.com"},{...valid,email:"missing"},{...valid,password:"short"},{...valid,password:" ".repeat(12)},{...valid,password:"x".repeat(129)},{...valid,role:"owner"},{...valid,is_active:false},{...valid,user_id:"arbitrary"},{...valid,created_by:"arbitrary"}])assert.throws(()=>staffInput(input));
});

test("staff passwords enforce 8–22 characters and every required character class",()=>{
 for(const value of ["Abcdef1!","Abcdef1!"+"x".repeat(14)])assert.equal(isStrongStaffPassword(value),true);
 for(const value of ["Abcd1!x","Abcdef1!"+"x".repeat(15),"abcdef1!","ABCDEF1!","Abcdefgh!","Abcdefg1","Abc def1!",null,123])assert.equal(isStrongStaffPassword(value),false);
 assert.equal(staffInput({...valid,password:"Abcdef1!"}).password,"Abcdef1!");
});
