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

export async function getRedisBufferMemory(sessionId: string) {
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
  const memory = await getRedisBufferMemory(sessionId);

  const chain = new ConversationChain({
    llm: createModel(modelName),
    memory,
  });

  const { response } = await chain.call({ input });

  return response ?? "I am sorry, I didn't understand that.";
}

export async function getMessagesBySessionId(sessionId: string) {
  const memory = await getRedisBufferMemory(sessionId);
  return JSON.stringify(await memory.chatHistory.getMessages());
}

export async function listSessions() {
  const client = await createRedisConnection();
  const keys = await client.keys("*");
  return keys.filter((key) => !key.includes("data"));
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

/**
 * @param sessionId {string}
 * @param data {object}
 * @returns {Promise<void>}
 * @description Set session data.
 */
async function setSessionData(
  sessionId: string,
  data: object
): Promise<string | null> {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  const client = await createRedisConnection();
  const session = await client.exists(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const prevData = await client.get(`data::${sessionId}`);

  if (!prevData) {
    await client.set(`data::${sessionId}`, JSON.stringify(data));
  } else {
    await client.set(
      `data::${sessionId}`,
      JSON.stringify({ ...JSON.parse(prevData), ...data })
    );
  }

  client.quit();

  return sessionId;
}

export async function setSessionStatusById(sessionId: string, active: boolean) {
  return setSessionData(sessionId, { active });
}

export async function setSessionNameById(sessionId: string, name: string) {
  return setSessionData(sessionId, { name });
}

export async function getActiveSession() {
  const client = await createRedisConnection();
  const keys = await client.keys("data::*");
  return keys.filter((key) => JSON.parse(key)?.active);
}
