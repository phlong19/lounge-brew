import {timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";
import {drainMediaDeletionJobs} from "@/lib/server/media-cleanup";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
 const secret = process.env.CRON_SECRET;
 const supplied = Buffer.from(request.headers.get("authorization") ?? "");
 const expected = Buffer.from(`Bearer ${secret ?? ""}`);
 const headers = {"Cache-Control": "no-store"};
 if (!secret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
  return NextResponse.json({error: "Unauthorized"}, {status: 401, headers});
 }
 try {
  const pending = await drainMediaDeletionJobs();
  return NextResponse.json({pending}, {headers});
 } catch {
  return NextResponse.json({error: "Media cleanup failed"}, {status: 503, headers});
 }
}
