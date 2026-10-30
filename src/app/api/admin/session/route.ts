import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminApiError, apiFailure, assertSameOrigin, readJson, requireStaff } from "@/lib/server/admin-api";
export async function POST(request:Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request);
    if (typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 1000) throw new AdminApiError("Email hoặc mật khẩu không hợp lệ.");
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new AdminApiError("Chưa cấu hình kết nối Supabase.",503);
    const result = await supabase.auth.signInWithPassword({email:body.email,password:body.password});
    if (result.error) throw new AdminApiError("Email hoặc mật khẩu không đúng.",401);
    try { const {role} = await requireStaff(); return NextResponse.json({role}); }
    catch(error) { await supabase.auth.signOut(); throw error; }
  } catch(error) { return apiFailure(error); }
}
export async function DELETE(request:Request) {
  try { assertSameOrigin(request); const supabase = await createSupabaseServerClient(); if (supabase) await supabase.auth.signOut(); return NextResponse.json({ok:true}); }
  catch(error) { return apiFailure(error); }
}
