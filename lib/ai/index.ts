import { createMistralChatCompletion } from "./mistral";
import {
  createAudioResponse,
  createAudioTranscription,
  createOpenAIChatCompletion,
} from "./openai";

async function selectBaseModel(
  baseModel: string,
  modelName: string,
  text: string
) {
  switch (baseModel) {
    case BaseModel.OpenAI:
      return await createOpenAIChatCompletion(modelName, text);
    case BaseModel.Mistral:
      return await createMistralChatCompletion(modelName, text);
    default:
      throw new Error("Invalid base model");
  }
}

export async function createAIResponse(
  baseModel: string,
  modelName: string,
  blob: ArrayBuffer
) {
  const file = Buffer.from(blob);
  const { text } = await createAudioTranscription(file);
  const completion = await selectBaseModel(baseModel, modelName, text);
  const buffer = await createAudioResponse(completion);

  return buffer;
}
