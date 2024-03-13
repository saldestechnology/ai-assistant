import { NextRequest } from "next/server";
import { createSpeechToTextResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    return new Response(
      await createSpeechToTextResponse(await request.arrayBuffer()),
      {
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (error: any) {
    console.log(error);
    return new Response(error.message, {
      headers: {
        "Content-Type": "text/plain",
      },
      status: 500,
    });
  }
}
