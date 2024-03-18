"use client";

import React, { useEffect, useRef, useState } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <section className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center h-full">
        <h1 className="text-4xl font-bold text-center mb-4">
          AI Assistant: Jeffrey
        </h1>
        <p className="text-lg">
          Press the record button and ask a question to Jeffrey.
        </p>
        <p className="text-lg">Please pick a completion model.</p>
        <select
          className="outline-none border border-white px-4 py-2 rounded-md mt-4 bg-black text-white"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setModel(e.target.value);
          }}
          title="Select Model"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
          <option value="open-mistral-7b">open-mistral-7b</option>
          <option value="open-mixtral-8x7b">open-mixtral-8x7b</option>
          <option value="mistral-small-latest">mistral-small-latest</option>
        </select>
        <button
          className="outline-none border border-white px-4 py-2 rounded-md mt-4"
          onClick={handleRecording}
        >
          {isRecording ? "Recording..." : "Record"}
        </button>
      </section>
      <section className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center h-full">
        {isLoading && <p className="m-0 p-0">Loading...</p>}
      </section>
    </div>
  );
}
