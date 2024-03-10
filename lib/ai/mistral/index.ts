import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

function getMistralModel(modelName: string) {
  return new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    modelName,
  });
}

export async function createMistralChatCompletion(
  modelName: string,
  input: string
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant. Your name is Jeffrey."],
    ["human", "{input}"],
  ]);

  const model = getMistralModel(modelName);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({ input });

  console.log("createMistralChatCompletion", response);

  return response.content as string;
}
