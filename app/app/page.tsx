"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { encode } from "wav-encoder";

export default function page() {
  const UploadIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const SplitIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 3h5v5" />
      <path d="M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
      <path d="m15 9 6-6" />
    </svg>
  );

  const DownloadIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
  const router = useRouter();

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("Inactive");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setFileContent(e.target.result as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const uploadSeparate = async () => {
    if (!fileContent || !selectedFile) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([fileContent], { type: "audio/wav" }),
        selectedFile
      );

      const response = await axios.post("/api/audio/separate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status !== 200) {
        throw new Error("Upload failed123");
      }
      const { vocalUrl, drumsUrl, guitarUrl, otherUrl, actualUrl } =
        response.data;

      const queryParams = new URLSearchParams({
        vocalUrl,
        drumsUrl,
        guitarUrl,
        otherUrl,
        actualUrl,
      }).toString();

      router.push(`/output?${queryParams}`);
    } catch (error: any) {
      setError(`Error while uploading the file: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const recorder = new MediaRecorder(stream);
      //blob
      recorder.ondataavailable = (event) => {
        const blob = new Blob([event.data], { type: "audio/wav" });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingStatus("Finished");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingStatus("Recording");
    } catch (err: any) {
      console.error("Error accessing the microphone", err);
      setError("Error accessing the microphone: " + err.message);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && audioStream) {
      mediaRecorder.stop();
      audioStream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      setAudioStream(null);
    }
  };

  const recordSeparate = async () => {
    if (!audioBlob) {
      setError("No recording available.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // recorded audio to wav
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioData = await audioContext.decodeAudioData(arrayBuffer);

      const wavBlob = await encode({
        sampleRate: audioData.sampleRate,
        channelData: Array.from(
          { length: audioData.numberOfChannels },
          (_, i) => audioData.getChannelData(i)
        ),
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([wavBlob], { type: "audio/wav" }),
        "recording.wav"
      );

      const response = await axios.post("/api/audio/separate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status !== 200) {
        throw new Error("Upload failed");
      }
      const { vocalUrl, drumsUrl, guitarUrl, otherUrl } = response.data;

      const queryParams = new URLSearchParams({
        vocalUrl,
        drumsUrl,
        guitarUrl,
        otherUrl,
      }).toString();

      router.push(`/output?${queryParams}`);
    } catch (error: any) {
      setError(`Error while uploading the file: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingStatus("Inactive");
  };

  const buttonClass =
    "px-4 py-2 rounded-lg shadow-lg text-white bg-cyan-600 hover:bg-cyan-700 transition duration-300 text-sm w-full";

  return (
    <div>
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Melos</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Separate vocals from instrumentals with a single click. Upload or
          record audio to get started.
        </p>
        <div className="flex flex-wrap gap-6 p-4 justify-center">
          {/* Upload Music Files */}
          <div className="bg-white border border-gray-400 p-4 rounded-lg shadow-md w-72 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Upload Music Files
            </h2>
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-3 h-28 flex items-center justify-center text-gray-600">
              {selectedFile || "Drag & Drop Music Files Here"}
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="mt-3 hidden"
              id="file-upload"
            />
            <br />
            <label
              htmlFor="file-upload"
              className={`mt-1 cursor-pointer bg-gray-600 hover:bg-gray-900 text-white px-4 py-2 rounded ${buttonClass}`}
            >
              Choose Files
            </label>

            <button
              className={`mt-3 bg-gray-600 hover:bg-gray-900 text-white px-4 py-2 rounded ${buttonClass}`}
              onClick={uploadSeparate}
              disabled={loading}
            >
              {loading ? "Processing..." : "Separate Audio"}
            </button>
          </div>

          <div className="bg-white border border-gray-400 p-4 rounded-lg shadow-md w-72 text-center flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Record Music On the Spot
            </h2>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg shadow-md text-white ${
                recording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-600 hover:bg-gray-900"
              } transition duration-300 text-sm w-full mb-3`}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
            <div className="text-sm text-gray-700 mb-2">
              Recording Status: {recordingStatus}
            </div>
            {audioUrl && (
              <>
                <audio controls src={audioUrl} className="mt-3 w-full">
                  Your browser does not support the audio element.
                </audio>
                <button
                  className={`mt-3 bg-gray-600 hover:bg-gray-900 text-white px-4 py-2 rounded ${buttonClass}`}
                  onClick={clearAudio}
                >
                  Clear Audio
                </button>
                <button
                  className={`mt-3 bg-gray-600 hover:bg-gray-900 text-white px-4 py-2 rounded ${buttonClass}`}
                  onClick={recordSeparate}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Separate Audio"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Supported file formats: MP3, WAV, OGG, M4A</p>
        <p className="mt-1">Maximum file size: 20MB</p>
      </div>
      <div className="mt-16 border-t pt-8 animate-slide-up">
        <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="border rounded-xl p-6 text-center">
            <div className="mb-4 w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center">
              <div className="mb-2 h-8 w-8 mx-auto rounded-full bg-primary flex items-center justify-center">
                <UploadIcon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Upload or Record</h3>
            <p className="text-sm text-muted-foreground">
              Upload an audio file or record directly using your microphone.
            </p>
          </div>

          <div className="border rounded-xl p-6 text-center">
            <div className="mb-4 w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center">
              <div className="mb-2 h-8 w-8 mx-auto rounded-full bg-primary flex items-center justify-center">
                <SplitIcon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Seprate Tracks</h3>
            <p className="text-sm text-muted-foreground">
              Our algorithm separates vocals from instrumentals
            </p>
          </div>

          <div className="border rounded-xl p-6 text-center">
            <div className="mb-4 w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center">
              <div className="mb-2 h-8 w-8 mx-auto rounded-full bg-primary flex items-center justify-center">
                <DownloadIcon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Download Results</h3>
            <p className="text-sm text-muted-foreground">
              Listen to and download the separated audio tracks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
