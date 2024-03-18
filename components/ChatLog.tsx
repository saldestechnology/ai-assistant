import { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import useConversation from "./hooks/useConversation";
import useSession from "./hooks/useSession";
import RecordRTC from "recordrtc";

interface ChatLogProps {
  baseModel: string;
  model: string;
  speechToText: boolean;
}

export default function ChatLog({
  baseModel,
  model,
  speechToText,
}: ChatLogProps) {
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);

  const [mediaRecorder, setMediaRecorder] = useState<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { conversation, updateConversation } = useConversation();
  const { sessionId } = useSession();

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

  /**
   * @param {string} role
   * @param {Blob} body
   * @returns {Promise<void>}
   * @description Handles the speech to text conversion and adds messages to conversation state
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
    updateConversation({ role, message });
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
  }, []);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation]);

  return (
    <section
      ref={chatLogRef}
      className="flex flex-col justify-between h-full w-full lg:px-64 md:px-32 sm:px-16 pt-8 overflow-x-auto"
    >
      <div className="flex flex-col items-center justify-start w-full">
        {conversation &&
          conversation.map((conversation, index) => (
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
  );
}
