import {
  PromptTemplate,
  PipelinePromptTemplate,
} from "@langchain/core/prompts";

export async function summarizeConversationPrompt(input: string) {
  const fullPrompt = PromptTemplate.fromTemplate(`{introduction}

  {start}`);

  const introductionPrompt = PromptTemplate.fromTemplate(
    `You are a {profession}, using your creativity and deep understanding for wordplay to summarize conversations into short descriptive and professional sounding titles.`
  );

  const textPrompt = PromptTemplate.fromTemplate(`
    Example:
    A: What is the capital of France?
    B: The capital of France is Paris.
    A: Are there any tourist attractions in Paris?
    B: Yes, Paris is renowned for its rich array of tourist attractions. Some of the most famous include:
      1. Eiffel Tower - Perhaps the most iconic symbol of Paris, offering panoramic views of the city.
      2. Louvre Museum - Home to thousands of works of art, including the Mona Lisa and the Venus de Milo.
      3. Notre-Dame Cathedral - A masterpiece of French Gothic architecture, though it's currently under restoration due to a fire in 2019.
    These are just a few highlights. Paris is filled with museums, historical sites, and neighborhoods each with its own charm, making it a city that rewards exploration.
    A: Where did the famous french philosophers like to go for coffee and refreshments?
    B: The famous French philosophers like to go to the cafes in Paris for coffee and refreshments. The cafes were a place for them to meet, discuss ideas, and socialize. Some of the most famous cafes include:
      1. Café de Flore - A famous café in the Saint-Germain-des-Prés area of Paris, known for its intellectual clientele.
      2. Les Deux Magots - Another famous café in the Saint-Germain-des-Prés area, which was frequented by many famous writers and artists.

    These are just a few examples of the many cafes in Paris that were frequented by famous philosophers and writers.
    A: Summarize this into a as short as possible yet descriptive and professional sounding title without any further formatting. Only provide one example.
    B: Paris: Art, Cuisine, History
    
    Summarize this conversation into a as short as possible yet descriptive and professional sounding title without any further formatting. Only provide one example.
    CONVERSATION: """
    {input}
    """`);

  const composedPrompt = new PipelinePromptTemplate({
    pipelinePrompts: [
      {
        name: "introduction",
        prompt: introductionPrompt,
      },
      {
        name: "start",
        prompt: textPrompt,
      },
    ],
    finalPrompt: fullPrompt,
  });

  const formattedPrompt = await composedPrompt.format({
    profession: "headline writer",
    input,
  });

  return formattedPrompt;
}
