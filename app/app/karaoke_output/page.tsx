"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function WaveformPlayer({
  audioUrl,
  color = "#000",
}: {
  audioUrl: string;
  color?: string;
}) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#aaa",
        progressColor: color,
        height: 100,
        responsive: true,
        barWidth: 1.5,
        cursorWidth: 2,
      });

      wavesurfer.current.load(audioUrl);

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  return (
    // <div>
    //   <div ref={waveformRef} className="w-full mb-3" />
    //   <button
    //     onClick={handlePlayPause}
    //     className="px-4 py-2 bg-grayy-600 text-white rounded-full hover:bg-gray-800"
    //   >
    //     Play / Pause
    //   </button>
    // </div>
    <div>
      <div ref={waveformRef} className="w-full mb-3" />

      <div className="w-6 h-6 bg-white border-2 border-gray-600 flex items-center justify-center rounded-md cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="blue"
          width="20"
          height="20"
          onClick={handlePlayPause}
          className="text-gray-600"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function KaraokeOutput() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("fileUrl");
  const fileUrl1 = searchParams.get("fileUrl11");
  const fileUrl2 = searchParams.get("fileUrl22");
  const fileUrl33 = searchParams.get("removeUrl");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileUrl || fileUrl1 || fileUrl2) {
      setLoading(false);
    }
  }, [fileUrl, fileUrl1, fileUrl2]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-3 bg-white">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Play Your Mixed Audio
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {fileUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Karaoke Version
            </h2>
            <WaveformPlayer audioUrl={fileUrl} color="#0d56b5" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    fileUrl,
                    fileUrl.substring(fileUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-blue-700 transition-colors "
              >
                Download Vocals
              </button>
            </div>
          </div>
        )}
        {fileUrl1 && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Uploaded Audio
            </h2>
            <WaveformPlayer audioUrl={fileUrl1} color="#0d56b5" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    fileUrl1,
                    fileUrl1.substring(fileUrl1.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-blue-700 transition-colors "
              >
                Download Vocals
              </button>
            </div>
          </div>
        )}
        {fileUrl33 && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Removed Audio
            </h2>
            <WaveformPlayer audioUrl={fileUrl33} color="#0d56b5" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    fileUrl33,
                    fileUrl33.substring(fileUrl33.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-blue-700 transition-colors "
              >
                Download
              </button>
            </div>
          </div>
        )}

        {fileUrl2 && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Recorded Audio
            </h2>
            <WaveformPlayer audioUrl={fileUrl2} color="#0d56b5" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    fileUrl2,
                    fileUrl2.substring(fileUrl2.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-blue-700 transition-colors "
              >
                Download Vocals
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
