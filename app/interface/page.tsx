"use client";
import { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";

export default function Interface() {
  const stream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [baseModel, setBaseModel] = useState("openai");

  const handleSelectBaseModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBaseModel(e.target.value);
    if (e.target.value === "openai") {
      setModel("gpt-3.5-turbo");
    } else {
      setModel("open-mistral-7b");
    }
  };

  const handleRecording = async () => {
    if (!mediaRecorder.current) {
      return;
    }
    if (isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsLoading(true);
      return;
    }
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  useEffect(() => {
    const initAudioCapturing = async () => {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioChunks: Blob[] = [];
      mediaRecorder.current = new MediaRecorder(stream.current);
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        // Send audioBlob to server
        const request = await fetch(
          `/api?baseModel=${baseModel}&model=${model}`,
          {
            method: "POST",
            body: audioBlob,
          }
        );
        const response = await request.blob();
        const responseUrl = URL.createObjectURL(response);
        const responseAudio = new Audio(responseUrl);
        responseAudio.play();
        audioChunks.length = 0;
        setIsLoading(false);
      };
    };
    initAudioCapturing();
  }, [model, baseModel]);

  return (
    <div className="flex flex-row h-screen max-h-screen">
      <aside className="flex flex-col p-4 w-1/5 border-r border-zinc-950 h-full">
        <div className="flex justify-end w-full">
          <button
            title="New chat"
            className="p-2 border bg-black text-white border-none"
          >
            <FaPenToSquare />
          </button>
        </div>
        <div className="flex justify-start w-full">
          <p>Chats</p>
        </div>
      </aside>
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
            </select>
            {baseModel === "openai" && (
              <select
                title="Select model"
                className="ml-2 p-2 border bg-black text-white border-zinc-950 rounded-md"
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
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
          </div>
        </header>
        <section className="flex flex-col justify-between h-full w-full px-64 pt-8">
          <div className="flex flex-col items-center justify-start w-full">
            <div className="flex flex-row w-full border-zinc-950 border rounded-md p-4">
              <h1>
                <span className="text-zinc-600 mr-4">Jeffrey:</span> Hello, how
                can I help you?
              </h1>
            </div>
          </div>
          <div className="flex w-full">
            <div className="h-full w-full border-zinc-950 border rounded-md p-4 flex flex-row items-end justify-center">
              <button
                title="Send voice message"
                className="p-2 border bg-black text-white border-zinc-950 rounded-md disabled:bg-zinc-500"
                onClick={handleRecording}
                disabled={isLoading}
              >
                {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <textarea
                placeholder="Write your message here..."
                title="Write your message here..."
                className="w-full border-none h-8 outline-none bg-transparent mx-8"
                rows={1}
              ></textarea>
              <button
                title="Send message"
                className="p-2 border bg-black text-white border-zinc-950 rounded-md mt-4"
              >
                <FaArrowUp />
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
