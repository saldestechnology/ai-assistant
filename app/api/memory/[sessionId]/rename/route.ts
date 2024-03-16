import { renameSession } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  if (await renameSession(params.sessionId)) {
    return new NextResponse("OK", {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } else {
    return new NextResponse("400", {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
}
