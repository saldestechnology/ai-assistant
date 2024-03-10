import fs from "fs";
import OpenAI from "openai";
import { createMistralChatCompletion } from "../mistral";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createAudioTranscription(file: Buffer) {
  fs.writeFileSync("audio.wav", file);
  const fileStream = fs.createReadStream("audio.wav");

  return await openai.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
  });
}

async function createOpenAIChatCompletion(model: string, text: string) {
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

async function createSpeech(text: string) {
  return await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: text,
  });
}

async function createAudioResponse(text: string) {
  const mp3 = await createSpeech(text);
  const buffer = Buffer.from(await mp3.arrayBuffer());

  return buffer;
}

export async function createAIResponse(modelName: string, blob: ArrayBuffer) {
  const file = Buffer.from(blob);
  const { text } = await createAudioTranscription(file);
  const completion = await createMistralChatCompletion(modelName, text);
  const buffer = await createAudioResponse(completion);

  return buffer;
}
