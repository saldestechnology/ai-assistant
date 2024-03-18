import { listSessions } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sessions = await listSessions();

  return new NextResponse(JSON.stringify(sessions), {
    headers: { "Content-Type": "application/json" },
  });
}
