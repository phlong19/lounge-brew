// Node-only upload/import analysis. Never import into public components.
import sharp from "sharp";
import { createHash } from "node:crypto";
import { ticketPalettes, type TicketPaletteKey } from "@/lib/ui/ticket-palettes";

export const ticketPaletteVersion = 1;
function hsv(r: number, g: number, b: number) {
 const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
 let hue = !d ? 0 : max === r ? ((g-b)/d)%6 : max === g ? (b-r)/d+2 : (r-g)/d+4;
 hue = (hue*60+360)%360;
 return {hue,saturation:max ? d/max : 0,light:(max+min)/510};
}
/** Emphasise poster edges/background over portraits; vote by hue, not average RGB. */
export function paletteFromPixels(pixels: Uint8Array, width: number, height: number): TicketPaletteKey {
 if (!width || !height || pixels.length !== width*height*4) throw Error("Invalid palette sample");
 const bins = Array.from({length:18},()=>({weight:0,x:0,y:0}));
 let brightness=0,total=0,chromatic=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
  const i=(y*width+x)*4, alpha=pixels[i+3]/255;
  if(alpha<0.5)continue;
  const {hue,saturation,light}=hsv(pixels[i],pixels[i+1],pixels[i+2]);
  const edge=x<width*.2||x>width*.8||y<height*.13||y>height*.87;
  const weight=(edge?3:0.55)*alpha;
  brightness+=light*weight;total+=weight;
  if(saturation<.16||light<.055||light>.94)continue;
  // Downweight warm portrait pixels in the centre, while preserving warm borders.
  const skin=!edge&&hue>10&&hue<48&&saturation<.7&&light>.25;
  const vote=weight*saturation*(skin?.12:1);
  const bin=bins[Math.floor(hue/20)%18];
  bin.weight+=vote;bin.x+=Math.cos(hue*Math.PI/180)*vote;bin.y+=Math.sin(hue*Math.PI/180)*vote;chromatic+=vote;
 }
 const light=total>0&&brightness/total>.57;
 const winner=bins.reduce((a,b)=>a.weight>=b.weight?a:b);
 let key='charcoal';
 if(chromatic>total*.055&&winner.weight>0) {
  const hue=(Math.atan2(winner.y,winner.x)*180/Math.PI+360)%360;
  const candidates=Object.entries(ticketPalettes).filter(([key])=>!key.includes('-')&&key!=='charcoal');
  key=candidates.reduce((best,current)=>{
   const distance=(h:number)=>Math.min(Math.abs(hue-h),360-Math.abs(hue-h));
   return distance(current[1].hue)<distance(best[1].hue)?current:best;
  })[0];
 }
 return (key+(light?'-light':'')) as TicketPaletteKey;
}
export async function extractTicketPalette(bytes: Buffer) {
 const {data,info}=await sharp(bytes,{limitInputPixels:40000000}).rotate().resize(96,96,{fit:'inside',withoutEnlargement:true}).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 return {key:paletteFromPixels(data,info.width,info.height),version:ticketPaletteVersion,hash:createHash('sha256').update(bytes).digest('hex')};
}
