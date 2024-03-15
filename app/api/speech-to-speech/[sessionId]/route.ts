import { NextRequest } from "next/server";
import { createSpeechToSpeechResponseWithMemory } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const baseModel = searchParams.get("baseModel") || "gpt-3.5-turbo";
  const model = searchParams.get("model") || "gpt-3.5-turbo";
  const sessionId = params.sessionId;
  const arrayBuffer = await request.arrayBuffer();
  console.log("sessionId", sessionId, "baseModel", baseModel, "model", model);
  try {
    return new Response(
      await createSpeechToSpeechResponseWithMemory(
        baseModel,
        model,
        sessionId,
        arrayBuffer
      ),
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
