import { createRedisBufferMemory } from "@/lib/db";
import fs from "fs";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { Transcription } from "openai/resources/audio/transcriptions.mjs";
import { v4 as uuid } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function createOpenAIChatModel(modelName: string) {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName,
  });
}

export async function createAudioTranscription(
  file: Buffer
): Promise<[string, Transcription]> {
  const id = uuid();
  const fileName = `audio-createAudioTranscription-${id}.webm`;
  fs.writeFileSync(fileName, file);
  const fileStream = fs.createReadStream(fileName);

  return [
    fileName,
    await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
    }),
  ];
}

export async function createOpenAIChatCompletion(model: string, text: string) {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Your name is Jeffrey.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return (
    response?.choices[0]?.message?.content ??
    "I am sorry, I didn't understand that."
  );
}

export async function createOpenAIChatCompletionWithMemory(
  modelName: string,
  input: string,
  sessionId: string
) {
  const chain = new ConversationChain({
    llm: createOpenAIChatModel(modelName),
    memory: await createRedisBufferMemory(sessionId),
  });

  const { response } = await chain.call({ input });

  return response ?? "I am sorry, I didn't understand that.";
}

export async function createSpeech(text: string) {
  return await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: text,
  });
}

export async function createSpeechToText(
  file: Buffer
): Promise<[string, Transcription]> {
  const id = uuid();
  const fileName = `audio-createSpeechToText-${id}.webm`;
  fs.writeFileSync(fileName, file);
  const fileStream = fs.createReadStream(fileName);

  const response = await openai.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
    response_format: "text",
  });

  return [fileName, response];
}

export async function createAudioResponse(text: string) {
  const file = await createSpeech(text);
  const buffer = Buffer.from(await file.arrayBuffer());

  return buffer;
}
