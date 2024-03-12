import { NextRequest } from "next/server";
import { createAIResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseModel = searchParams.get("baseModel") || "gpt-3.5-turbo";
  const model = searchParams.get("model") || "gpt-3.5-turbo";

  try {
    return new Response(
      await createAIResponse(baseModel, model, await request.arrayBuffer()),
      {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      }
    );
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
