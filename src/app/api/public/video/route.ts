import {NextResponse} from "next/server";
import {readPublicVideo} from "@/lib/server/event-extras";
export async function GET(){try{return NextResponse.json(await readPublicVideo(),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"Content unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}}
