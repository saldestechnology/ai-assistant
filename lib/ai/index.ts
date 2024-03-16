import { BaseModel } from "@/types/BaseModel";
import { createMistralChatCompletion, createMistralModel } from "./mistral";
import {
  createAudioResponse,
  createAudioTranscription,
  createOpenAIChatCompletion,
  createOpenAIChatCompletionWithMemory,
  createOpenAIChatModel,
  createSpeechToText,
} from "./openai";
import { unlink } from "fs";
import {
  createAnthropicChatCompletion,
  createAnthropicModel,
} from "./anthropic";
import { createModelWithMemory } from "../db";

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
    case BaseModel.Anthropic:
      return await createAnthropicChatCompletion(modelName, text);
    default:
      throw new Error("Invalid base model");
  }
}

export async function selectBaseModelWithMemory(
  baseModel: string,
  modelName: string,
  sessionId: string,
  text: string
) {
  switch (baseModel) {
    case BaseModel.OpenAI:
      return await createModelWithMemory(
        modelName,
        text,
        sessionId,
        createOpenAIChatModel
      );
    case BaseModel.Mistral:
      return await createModelWithMemory(
        modelName,
        text,
        sessionId,
        createMistralModel
      );
    case BaseModel.Anthropic:
      return await createModelWithMemory(
        modelName,
        text,
        sessionId,
        createAnthropicModel
      );
    default:
      throw new Error("Invalid base model");
  }
}

export async function createChatResponse(
  baseModel: string,
  modelName: string,
  text: string
) {
  const completion = await selectBaseModel(baseModel, modelName, text);

  return completion;
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

export async function createSpeechToSpeechResponseWithMemory(
  baseModel: string,
  modelName: string,
  sessionId: string,
  blob: ArrayBuffer
) {
  const file = Buffer.from(blob);
  const [_fileName, response] = await createAudioTranscription(file);
  const completion = await selectBaseModelWithMemory(
    baseModel,
    modelName,
    sessionId,
    response.text
  );
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
