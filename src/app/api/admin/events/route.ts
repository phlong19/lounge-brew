import { NextResponse } from "next/server";
import { apiFailure, assertSameOrigin, databaseFailure, readJson, resolveEventCover, requireStaff } from "@/lib/server/admin-api";
import { eventPayload } from "@/lib/admin/event-validation";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const {supabase} = await requireStaff(request);
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
    const limit = Math.max(1, Math.min(100, Number(params.get("limit")) || 100));
    const result = await supabase.from("events").select("*",{count:"exact"}).eq("is_deleted",false).order("event_date",{ascending:true}).order("id").range((Math.floor(page)-1)*Math.floor(limit),Math.floor(page)*Math.floor(limit)-1);
    databaseFailure(result.error);
    return NextResponse.json({items:result.data,total:result.count,page:Math.floor(page),limit:Math.floor(limit)},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return apiFailure(error); }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const {supabase,user} = await requireStaff(request);
    const payload = eventPayload(await readJson(request));
    await resolveEventCover(supabase,payload);
    if (!payload.cover_asset_id && !payload.cover_image_url) return NextResponse.json({error:"Vui lòng chọn ảnh chương trình."},{status:400});
    const result = await supabase.from("events").insert({...payload,created_by:user.id,updated_by:user.id}).select().single();
    databaseFailure(result.error);
    revalidatePath("/"); revalidatePath("/events");
    return NextResponse.json({item:result.data},{status:201});
  } catch(error) { return apiFailure(error); }
}
