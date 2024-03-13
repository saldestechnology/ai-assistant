import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";

function getAnthropicModel(modelName: string) {
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

  const model = getAnthropicModel(modelName);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({ input });

  console.log("createAnthropicChatCompletion", response);

  return response.content.toString();
}
