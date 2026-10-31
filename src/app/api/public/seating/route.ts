import {NextResponse} from "next/server";
import {readPublicSeating} from "@/lib/server/event-extras";
export async function GET(){
 try{return NextResponse.json(await readPublicSeating(),{headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({error:"Content unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
