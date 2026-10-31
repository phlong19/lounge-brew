import {test} from "node:test";
import assert from "node:assert/strict";
import {createPublicQueryClient,publicEventsOptions,publicSeatingOptions,publicKeys} from "../../src/lib/public/query.ts";
test("public queries share requests, omit session cookies, retain stale data on failure and accept authoritative empties",async()=>{
 const previous=globalThis.fetch,client=createPublicQueryClient();let calls=0;
 globalThis.fetch=async(path,options)=>{calls++;assert.equal(path,"/api/public/events");assert.equal(options.credentials,"omit");assert(options.signal instanceof AbortSignal);return Response.json([{id:"visible"}]);};
 try{
  const [home,booking]=await Promise.all([client.fetchQuery(publicEventsOptions()),client.fetchQuery(publicEventsOptions())]);
  assert.deepEqual(home,booking);assert.equal(calls,1);
  await client.fetchQuery(publicEventsOptions());assert.equal(calls,1);
  await client.invalidateQueries({queryKey:publicKeys.events,refetchType:"none"});
  globalThis.fetch=async()=>Response.json({error:"offline"},{status:503});
  await assert.rejects(client.fetchQuery({...publicEventsOptions(),retry:false}));
  assert.deepEqual(client.getQueryData(publicKeys.events),[{id:"visible"}]);
  globalThis.fetch=async()=>Response.json([]);
  assert.deepEqual(await client.fetchQuery(publicEventsOptions()),[]);
  globalThis.fetch=async()=>Response.json(null);
  assert.equal(await client.fetchQuery(publicSeatingOptions()),null);
  assert.deepEqual(client.getQueryData(["admin","events"]),undefined);
 }finally{globalThis.fetch=previous;client.clear();}
});
test("public query cancellation reaches the request",async()=>{
 const previous=globalThis.fetch,client=createPublicQueryClient();let signal;
 globalThis.fetch=async(path,options)=>{signal=options.signal;return new Promise((resolve,reject)=>{signal.addEventListener("abort",()=>reject(new DOMException("Cancelled","AbortError")));});};
 try{
  const pending=client.fetchQuery(publicEventsOptions());pending.catch(()=>{});
  await client.cancelQueries({queryKey:publicKeys.events});
  assert.equal(signal.aborted,true);await assert.rejects(pending);
 }finally{globalThis.fetch=previous;client.clear();}
});
