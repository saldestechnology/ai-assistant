"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowUp, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import RecordRTC from "recordrtc";
import { v4 as uuid } from "uuid";

interface Conversation {
  role: string;
  message: string;
}

export default function Interface() {
  const recorderRef = useRef<RecordRTC | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaStream | null>(null);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [baseModel, setBaseModel] = useState("openai");
  const [speechToText, setSpeechToText] = useState(true);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatLogRef = useRef<HTMLDivElement | null>(null);

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

  const handleStopRecording = async () => {
    const blob = recorderRef.current?.getBlob();
    if (blob) {
      if (speechToText) {
        handleSpeechToText("User", blob);
      }
    }
    const request = await fetch(
      `/api/speech-to-speech/${sessionId}?baseModel=${baseModel}&model=${model}`,
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
      handleSpeechToText("Jeffrey", response);
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
  const handleSpeechToText = async (
    role: string,
    body: Blob
  ): Promise<void> => {
    const request = await fetch("/api/speech-to-text", {
      method: "POST",
      body,
    });
    const message = await request.text();
    setConversation((prev) => [...prev, { role, message }]);
  };

  const createNewSession = () => {
    setSessionId(uuid());
    setConversation([]);
  };

  const setCurrentSession = async (sid: string) => {
    setConversation([]);
    await getConversation(sid);
  };

  const getSessions = useCallback(async () => {
    const request = await fetch("/api/memory/list");
    const sessions = await request.json();
    setAvailableSessions(sessions);
  }, []);

  const getConversation = async (sid: string) => {
    setSessionId(sid);
    const request = await fetch(`/api/memory/${sid}`);
    const messages = await request.json();
    setConversation(
      messages.map((message: any) => {
        if (message.id.includes("HumanMessage")) {
          return { role: "User", message: message.kwargs.content };
        }
        return { role: "Jeffrey", message: message.kwargs.content };
      })
    );
  };

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
    getSessions();
  }, [getSessions]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation]);

  return (
    <div className="flex flex-row h-screen max-h-screen">
      <aside className="flex flex-col p-4 w-1/5 border-r border-zinc-950 h-full">
        <div className="flex justify-end w-full">
          <button
            title="New chat"
            className="p-2 border bg-black text-white border-none"
            onClick={createNewSession}
          >
            <FaPenToSquare />
          </button>
        </div>
        <div className="flex flex-col justify-start w-full">
          <h3 className="">Chats</h3>
          <ul className="my-4">
            {availableSessions.map((session, index) => (
              <li
                className="py-2 border  border-zinc-950 border-x-0"
                key={`session-${index}`}
              >
                <button
                  className="w-full h-full bg-transparent border-none text-left"
                  onClick={async () => await setCurrentSession(session)}
                >
                  {session}
                </button>
              </li>
            ))}
          </ul>
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
                <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                <option value="gpt-4-0125-preview">GPT-4 0125 Preview</option>
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
        <section
          ref={chatLogRef}
          className="flex flex-col justify-between h-full w-full lg:px-64 md:px-32 sm:px-16 pt-8 overflow-x-auto"
        >
          <div className="flex flex-col items-center justify-start w-full">
            {conversation.map((conversation, index) => (
              <div
                key={`conversation-${index}`}
                className="flex flex-row w-full border-zinc-950 border rounded-md p-4 my-1 last:mb-4"
              >
                <span className="text-zinc-600 mr-4 lg:w-1/12 md:w-1/6">
                  {conversation.role}:
                </span>
                <div className="w-11/12 lg:w-11/12 md:w-5/6">
                  {conversation.message.split("\n").filter((message, index) => {
                    // If the message is empty, don't render it
                    if (message === "") {
                      return false;
                    }
                    return (
                      <p
                        key={`message-${index}`}
                        className="text-white text-left py-4 first:pt-0 last:pb-0"
                      >
                        {message}
                      </p>
                    );
                  })}
                </div>
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
