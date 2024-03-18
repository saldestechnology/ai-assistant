import { createSession, getMessagesBySessionId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  return new NextResponse(await getMessagesBySessionId(params.sessionId), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await createSession(params.sessionId);
    return new NextResponse("Created", { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
