import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
registerHooks({resolve(s,c,n){return n(s.startsWith('@/')?pathToFileURL(`${process.cwd()}/src/${s.slice(2)}.ts`).href:s,c)}});
const {normalizeTicketColor,ticketInk,ticketBackground}=await import('../../src/lib/ui/ticket-color.ts');
test('ticket colours reject CSS injection and retain exact custom hex',()=>{
 assert.equal(normalizeTicketColor('#a1b2c3'),'#A1B2C3');
 for(const value of ['red','#123','#12345678','url(x)',null,42])assert.equal(normalizeTicketColor(value),null);
 assert.equal(ticketBackground('forest'),'#244736');assert.equal(ticketBackground('#123456'),'#123456');
});
test('chosen ticket ink has WCAG AA contrast across the colour cube',()=>{
 const lum=hex=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;};
 for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17){const bg='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');const a=lum(bg),i=lum(ticketInk(bg));assert((Math.max(a,i)+0.05)/(Math.min(a,i)+0.05)>=4.5);}
});
