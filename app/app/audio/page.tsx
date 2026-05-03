"use client";
import React, { useState, useRef } from "react";

export default function Audio() {
  const audioChunk = useRef<any[]>([]);
  const [recording, setRecording] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //stream has audio

    const mediaRecorder = new MediaRecorder(stream);
    //media recorder istant created that  , recrods the audio and spilits it into chunks

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        audioChunk.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunk.current, { type: "audio/wav" });
      const audioURL = URL.createObjectURL(audioBlob);
      setRecording((prevRecording) => [...prevRecording, audioURL]);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      <div>
        <h1>Audio Recorder</h1>
        <button className="bg-blue" onClick={startRecording}>
          Start Recording
        </button>
        <br />
        <button onClick={stopRecording}>Stop Recording</button>
        {recording.map((recUrl, index) => {
          return (
            <div key={index}>
              <audio controls src={recUrl} />
              <a href={recUrl} download>
                Download
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
