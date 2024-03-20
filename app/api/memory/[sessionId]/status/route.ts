import { setSessionStatusById } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");

  try {
    if (state === "active") {
      return new NextResponse(
        await setSessionStatusById(params.sessionId, true),
        {
          headers: { "Content-Type": "text/plain" },
          status: 200,
        }
      );
    }

    if (state === "inactive") {
      return new NextResponse(
        await setSessionStatusById(params.sessionId, false),
        {
          headers: { "Content-Type": "text/plain" },
          status: 200,
        }
      );
    }

    return new NextResponse(JSON.stringify({ error: "Invalid state" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
