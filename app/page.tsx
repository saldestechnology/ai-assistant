"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { RxPaperPlane } from "react-icons/rx";

export default function Home() {
  const stream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");

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
        const request = await fetch(`/api?model=${model}`, {
          method: "POST",
          body: audioBlob,
        });
        const response = await request.blob();
        const responseUrl = URL.createObjectURL(response);
        const responseAudio = new Audio(responseUrl);
        responseAudio.play();
        audioChunks.length = 0;
        setIsLoading(false);
      };
    };
    initAudioCapturing();
  }, [model]);

  const handleSelectModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
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

  return (
    <div className="flex flex-col h-full">
      <section className="flex">
        <select
          onChange={handleSelectModel}
          className="bg-black border border-white text-white"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
          <option value="open-mistral-7b">open-mistral-7b</option>
          <option value="open-mixtral-8x7b">open-mixtral-8x7b</option>
          <option value="mistral-small-latest">mistral-small-latest</option>
        </select>
      </section>
      <section className="flex w-full h-full">
        <p>Chat area</p>
      </section>
      <section className="flex justify-start">
        <button
          onClick={handleRecording}
          className={`${
            isRecording ? "bg-red-500" : "bg-blue-500"
          } text-white px-4 py-2`}
        >
          {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <input
          type="text"
          placeholder="Enter your message"
          className="w-full bg-black border border-white leading-8 px-2"
        />
        <button
          onClick={handleRecording}
          className="bg-blue-500 text-white px-4 py-2"
        >
          <RxPaperPlane />
        </button>
      </section>
    </div>
  );
}
