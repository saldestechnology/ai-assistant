import { NextRequest } from "next/server";
import { createSpeechToSpeechResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseModel = searchParams.get("baseModel") || "gpt-3.5-turbo";
  const model = searchParams.get("model") || "gpt-3.5-turbo";
  const arrayBuffer = await request.arrayBuffer();
  try {
    return new Response(
      await createSpeechToSpeechResponse(baseModel, model, arrayBuffer),
      {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, {
      headers: { "Content-Type": "text/plain" },
      status: 500,
    });
  }
}
