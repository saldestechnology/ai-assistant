import { BaseModel } from "@/types/BaseModel";
import { createMistralChatCompletion } from "./mistral";
import {
  createAudioResponse,
  createAudioTranscription,
  createOpenAIChatCompletion,
  createSpeechToText,
} from "./openai";
import { unlink } from "fs";

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

export async function createSpeechToSpeechResponse(
  baseModel: string,
  modelName: string,
  blob: ArrayBuffer
) {
  const file = Buffer.from(blob);
  const [_fileName, response] = await createAudioTranscription(file);
  const completion = await selectBaseModel(baseModel, modelName, response.text);
  const buffer = await createAudioResponse(completion);

  return buffer;
}

export async function cleanUp(fileName: string) {
  unlink(fileName, (err) => {
    if (err) {
      throw err;
    }
  });
}

export async function createSpeechToTextResponse(blob: ArrayBuffer) {
  const file = Buffer.from(blob);
  const [_fileName, response] = await createSpeechToText(file);

  return response as unknown as string;
}
