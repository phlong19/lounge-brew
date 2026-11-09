import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
registerHooks({resolve(s,c,n){return n(s.startsWith('@/')?pathToFileURL(process.cwd()+'/src/'+s.slice(2)+'.ts').href:s,c);}});
const {extractTicketPalette,paletteFromPixels}=await import('../../src/lib/media/extract-ticket-palette.ts');
const {ticketPalettes,ticketPalette}=await import('../../src/lib/ui/ticket-palettes.ts');
test('poster background wins over warm central portrait; transparent samples stay safe',()=>{
 const width=40,height=50,pixels=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const face=x>8&&x<32&&y>7&&y<43;pixels.set(face?[205,150,115,255]:[24,75,44,255],(y*width+x)*4);}
 assert.equal(paletteFromPixels(pixels,width,height),'forest');
 assert.equal(paletteFromPixels(new Uint8Array(16),2,2),'charcoal');
 assert.throws(()=>paletteFromPixels(new Uint8Array(1),2,2));
 assert.equal(ticketPalette('__proto__'),null);
});
test('neutral and bright covers get suitable tones; byte hashing is deterministic',async()=>{
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:'#ead491'}}).png().toBuffer();
 const first=await extractTicketPalette(bytes),second=await extractTicketPalette(bytes);
 assert.equal(first.key,'amber-light');assert.deepEqual(first,second);assert.match(first.hash,/^[0-9a-f]{64}$/);
 const grey=await sharp({create:{width:20,height:20,channels:3,background:'#424242'}}).png().toBuffer();
 assert.equal((await extractTicketPalette(grey)).key,'charcoal');
});
test('all paper/ink pairs meet normal-text contrast and palette keys map to static classes',()=>{
 const luminance=hex=>{const rgb=hex.match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
 for(const [key,palette] of Object.entries(ticketPalettes)){
  const [,bg,ink]=palette.stock.match(/bg-\[#([0-9A-F]+)\] text-\[#([0-9A-F]+)\]/);
  const a=luminance(bg),b=luminance(ink);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,key);
 }
});
