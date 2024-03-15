import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/redis";
import { ConversationChain } from "langchain/chains";
import { createClient } from "redis";

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
