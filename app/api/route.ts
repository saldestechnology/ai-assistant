import { NextRequest } from "next/server";
import { createAIResponse } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const model = searchParams.get("model") || "gpt-3.5-turbo";

  return new Response(
    await createAIResponse(model, await request.arrayBuffer()),
    {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    }
  );
}
