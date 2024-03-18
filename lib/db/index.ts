import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/redis";
import { ConversationChain } from "langchain/chains";
import { createClient } from "redis";
import { createChatResponse } from "../ai";
import { summarizeConversationPrompt } from "../ai/prompts";
import { create } from "domain";

export async function createRedisConnection() {
  const client = createClient({
    url: "redis://localhost:6379",
  });
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();
  return client;
}

export async function createRedisBufferMemory(sessionId: string) {
  return new BufferMemory({
    chatHistory: new RedisChatMessageHistory({
      sessionId,
      config: {
        url: "redis://localhost:6379",
      },
    }),
  });
}

export async function createModelWithMemory(
  modelName: string,
  input: string,
  sessionId: string,
  createModel: (model: string) => any
) {
  const memory = await createRedisBufferMemory(sessionId);

  const chain = new ConversationChain({
    llm: createModel(modelName),
    memory,
  });

  const { response } = await chain.call({ input });

  return response ?? "I am sorry, I didn't understand that.";
}

export async function getMessagesBySessionId(sessionId: string) {
  const memory = await createRedisBufferMemory(sessionId);
  return JSON.stringify(await memory.chatHistory.getMessages());
}

export async function listSessions() {
  const client = await createRedisConnection();
  return await client.keys("*");
}

export async function renameSession(sessionId: string) {
  try {
    const client = await createRedisConnection();
    const chatHistory = await getMessagesBySessionId(sessionId);
    const messages = JSON.parse(chatHistory);

    const summary = messages
      .map((message: any) =>
        message.id.includes("HumanMessage")
          ? `A: ${message.kwargs.content}\n`
          : `B: ${message.kwargs.content}\n`
      )
      .join(" ");

    const answer = await createChatResponse(
      "openai",
      "gpt-3.5-turbo",
      await summarizeConversationPrompt(summary)
    );

    await client.rename(sessionId, answer);

    return true;
  } catch (error) {
    return false;
  }
}
