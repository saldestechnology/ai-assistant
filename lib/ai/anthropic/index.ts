import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export function createAnthropicModel(modelName: string) {
  return new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName,
  });
}

export async function createAnthropicChatCompletion(
  modelName: string,
  input: string
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant. Your name is Jeffrey."],
    ["human", "{input}"],
  ]);

  const model = createAnthropicModel(modelName);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({ input });

  return response.content.toString();
}
