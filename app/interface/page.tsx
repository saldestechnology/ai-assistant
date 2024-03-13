"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowUp, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import RecordRTC from "recordrtc";

interface Conversation {
  role: string;
  message: string;
}

export default function Interface() {
  const recorderRef = useRef<RecordRTC | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaStream | null>(null);
  // const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [baseModel, setBaseModel] = useState("openai");
  const [speechToText, setSpeechToText] = useState(true);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectBaseModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBaseModel(e.target.value);
    if (e.target.value === "openai") {
      setModel("gpt-3.5-turbo");
    } else {
      setModel("open-mistral-7b");
    }
  };

  const handleStopRecording = async () => {
    const blob = recorderRef.current?.getBlob();
    if (blob) {
      if (speechToText) {
        handleSpeechToText("User", blob);
      }
    }
    const request = await fetch(
      `/api/speech-to-speech?baseModel=${baseModel}&model=${model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "audio/webm",
        },
        body: blob,
      }
    );
    const response = await request.blob();
    const responseUrl = URL.createObjectURL(response);
    const responseAudio = new Audio(responseUrl);

    if (speechToText) {
      handleSpeechToText("Jeffery", response);
    }

    responseAudio.play();

    setIsRecording(false);
    setIsLoading(false);
  };

  const handleRecording = async () => {
    if (!recorderRef.current) {
      return;
    }
    if (isRecording) {
      recorderRef.current.stopRecording(handleStopRecording);
    } else {
      if (!mediaRecorder) {
        return;
      }
      recorderRef.current = new RecordRTC(mediaRecorder, {
        type: "audio",
        mimeType: "audio/webm",
      });
      recorderRef.current.startRecording();
      setIsRecording(true);
    }
  };

  const toggleSpeechToText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeechToText(e.target.checked);
  };

  /**
   * @param {string} role
   * @param {Blob} body
   * @returns {Promise<void>}
   * @description Handles the speech to text conversion and adds utterance to conversation state
   */
  const handleSpeechToText = useCallback(async (role: string, body: Blob) => {
    const request = await fetch("/api/speech-to-text", {
      method: "POST",
      body,
    });
    const message = await request.text();
    setConversation((prev) => [...prev, { role, message }]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaRecorder(stream);
      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
      });
    };
    init();
  }, []);

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
          <div>
            <label
              htmlFor="recording-state"
              className="py-2 px-4 border bg-black text-white border-zinc-950 rounded-md"
            >
              {recorderRef.current && recorderRef.current.getState()}
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
        <section className="flex flex-col justify-between h-full w-full px-64 pt-8 overflow-x-auto">
          <div className="flex flex-col items-center justify-start w-full">
            {conversation.map((conversation, index) => (
              <div
                key={`conversation-${index}`}
                className="flex flex-row w-full border-zinc-950 border rounded-md p-4 my-1"
              >
                <h1>
                  <span className="text-zinc-600 mr-4">
                    {conversation.role}:
                  </span>
                  {conversation.message}
                </h1>
              </div>
            ))}
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
