import { getMessagesBySessionId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  return new NextResponse(await getMessagesBySessionId(params.sessionId), {
    headers: { "Content-Type": "application/json" },
  });
}
