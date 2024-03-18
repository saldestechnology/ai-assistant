"use client";
import ChatLog from "@/components/ChatLog";
import SessionList from "@/components/SessionList";
import { ConversationProvider, SessionProvider } from "@/components/hooks";
import { useState } from "react";

export default function Interface() {
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [baseModel, setBaseModel] = useState("openai");
  const [speechToText, setSpeechToText] = useState(true);

  const handleSelectBaseModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBaseModel(e.target.value);
    switch (e.target.value) {
      case "openai":
        setModel("gpt-3.5-turbo");
        break;
      case "mistral":
        setModel("open-mistral-7b");
        break;
      case "anthropic":
        setModel("claude-3-opus-20240229");
        break;
      default:
        break;
    }
  };

  const toggleSpeechToText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeechToText(e.target.checked);
  };

  return (
    <SessionProvider>
      <ConversationProvider>
        <div className="flex flex-row h-screen max-h-screen">
          <SessionList />
          <section className="flex flex-col p-4 items-center w-full max-h-screen">
            <header className="flex flex-row justify-between w-full">
              <div>
                <select
                  title="Select base model"
                  className="p-2 border bg-black text-white border-zinc-950 rounded-md"
                  onChange={handleSelectBaseModel}
                >
                  <option value="openai">OpenAI</option>
                  <option value="mistral">Mistral</option>
                  <option value="anthropic">Anthropic</option>
                </select>
                {baseModel === "openai" && (
                  <select
                    title="Select model"
                    className="ml-2 p-2 border bg-black text-white border-zinc-950 rounded-md"
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo-preview">
                      GPT-4 Turbo Preview
                    </option>
                    <option value="gpt-4-0125-preview">
                      GPT-4 0125 Preview
                    </option>
                  </select>
                )}
                {baseModel === "mistral" && (
                  <select
                    title="Select model"
                    className="p-2 border bg-black text-white border-zinc-950 rounded-md"
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="open-mistral-7b">open-mistral-7b</option>
                    <option value="open-mixtral-8x7b">open-mixtral-8x7b</option>
                    <option value="mistral-small-latest">
                      mistral-small-latest
                    </option>
                  </select>
                )}
                {baseModel === "anthropic" && (
                  <select
                    title="Select model"
                    className="p-2 border bg-black text-white border-zinc-950 rounded-md"
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="claude-3-opus-20240229">
                      claude-3-opus-20240229
                    </option>
                    <option value="claude-3-sonnet-20240229">
                      claude-3-sonnet-20240229
                    </option>
                  </select>
                )}
              </div>
              <div>
                <label
                  htmlFor="recording-state"
                  className="py-2 px-4 border bg-black text-white border-zinc-950 rounded-md"
                >
                  {/* {recorderRef.current && recorderRef.current.getState()} */}
                </label>
                <label
                  htmlFor="speech-to-text"
                  className="ml-2 py-2 px-4 border bg-black text-white border-zinc-950 rounded-md"
                >
                  <input
                    type="checkbox"
                    id="speech-to-text"
                    name="speech-to-text"
                    className="mr-2"
                    onChange={toggleSpeechToText}
                    checked={speechToText}
                  />
                  Speech to text
                </label>
              </div>
            </header>
            <ChatLog
              model={model}
              baseModel={baseModel}
              speechToText={speechToText}
            />
          </section>
        </div>
      </ConversationProvider>
    </SessionProvider>
  );
}
