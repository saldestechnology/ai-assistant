import { activateSessionById, deactivateSessionById } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  console.log("params", params.sessionId);

  try {
    if (state === "active") {
      await activateSessionById(params.sessionId);
      return new NextResponse("OK", {
        headers: { "Content-Type": "text/plain" },
        status: 200,
      });
    }

    if (state === "inactive") {
      await deactivateSessionById(params.sessionId);
      return new NextResponse("OK", {
        headers: { "Content-Type": "text/plain" },
        status: 200,
      });
    }

    return new NextResponse(JSON.stringify({ error: "Invalid state" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
