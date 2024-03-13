import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/redis";
import { ConversationChain } from "langchain/chains";

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

  console.log(await memory.chatHistory.getMessages());

  const { response } = await chain.call({ input });

  console.log({ response });

  return response ?? "I am sorry, I didn't understand that.";
}
