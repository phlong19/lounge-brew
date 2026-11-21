import {contentEnvelope,commitContent} from "@/lib/server/content-lifecycle";
import {NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import {apiFailure,assertSameOrigin,databaseFailure,readJson,requireContentStaff} from "@/lib/server/admin-api";
import {blogPayload} from "@/lib/admin/blog-validation";
export async function GET(request:Request){try{
 const {supabase}=await requireContentStaff(request);const q=new URL(request.url).searchParams;
 const page=Math.max(1,Math.min(10000,Math.floor(Number(q.get("page"))||1))),limit=20;
 const result=await supabase.from("admin_article_summaries").select("*",{count:"exact"}).order("updated_at",{ascending:false}).order("id").range((page-1)*limit,page*limit-1);
 databaseFailure(result.error);return NextResponse.json({items:result.data,total:result.count,page,limit},{headers:{"Cache-Control":"no-store"}});
}catch(error){return apiFailure(error);}}
export async function POST(request:Request){try{
 assertSameOrigin(request);const {supabase}=await requireContentStaff(request);const raw=await readJson(request);const payload=blogPayload(contentEnvelope(raw).data);
 const item=await commitContent(supabase,"article",null,payload as Record<string,unknown>,raw);
 revalidatePath("/journal");revalidatePath("/");return NextResponse.json({item},{status:201});
}catch(error){return apiFailure(error);}}
