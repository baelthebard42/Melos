"use client";
import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
}

const AudioPlayer = ({ src, title }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;

    if (!audio || !canvas) return;

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;
    const canvasContext = canvas.getContext("2d");

    const drawWaveform = () => {
      if (!isPlaying || !canvasContext) return;

      requestAnimationFrame(drawWaveform);

      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = "#f3f4f6"; // Background color
      canvasContext.fillRect(0, 0, width, height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "#3b82f6"; // Waveform color
      canvasContext.beginPath();

      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(width, height / 2);
      canvasContext.stroke();
    };

    if (isPlaying) {
      drawWaveform();
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      audioContext.resume(); // Ensure audio context is active
      drawWaveform();
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      updateTime();
    };

    const handleLoadedMetadata = () => {
      updateDuration();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (source) {
        source.disconnect();
      }
      if (analyser) {
        analyser.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isPlaying, src, title]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      isPlaying ? audio.pause() : audio.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = parseFloat(event.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${title.toLowerCase().replace(/ /g, "_")}.mp3`; // Adjust filename as needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-20 bg-gray-100 rounded-md mb-2"
        width={300}
        height={80}
      />
      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        type="range"
        className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
      />
      <div className="flex items-center justify-end mt-2">
        <button
          onClick={togglePlay}
          className="mr-2 p-2 rounded-full hover:bg-gray-200"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3m-15-4l-4 4m0 0l4 4m-4-4h12"
            />
          </svg>
        </button>
      </div>
      <audio ref={audioRef} src={src} style={{ display: "none" }} />
    </div>
  );
};

export default function AudioDisplay() {
  // Replace these with your actual audio URLs
  const vocalsOnlyURL = "/audio/vocals_only.mp3";
  const instrumentalOnlyURL = "/audio/instrumental_only.mp3";
  const originalAudioURL = "/audio/original_audio.mp3";

  return (
    <div className="flex flex-wrap gap-4 justify-center p-4 bg-gray-100">
      <AudioPlayer src={vocalsOnlyURL} title="Vocals Only" />
      <AudioPlayer src={instrumentalOnlyURL} title="Instrumental Only" />
      <AudioPlayer src={originalAudioURL} title="Original Audio" />
    </div>
  );
}
