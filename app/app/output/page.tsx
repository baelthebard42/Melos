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
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "aaa#",
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
    //     className="px-4 py-2 bg-grayyyyyy-600 text-white rounded-full hover:bg-gray-800"
    //   >
    //     Play
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

export default function OutputPage() {
  const searchParams = useSearchParams();
  const vocalsUrl = searchParams.get("vocalUrl");
  const drumsUrl = searchParams.get("drumsUrl");
  const guitarUrl = searchParams.get("guitarUrl");
  const otherUrl = searchParams.get("otherUrl");
  const actualUrl = searchParams.get("actualUrl");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vocalsUrl || drumsUrl || guitarUrl || otherUrl) {
      setLoading(false);
    }
  }, [vocalsUrl, drumsUrl, guitarUrl, otherUrl]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-3 bg-white space-y-4">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Download & Play Your Files
      </h1>
      <div className="flex flex-wrap justify-start gap-6 w-full max-w-screen-lg">
        {actualUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Original Audio
            </h2>
            <WaveformPlayer audioUrl={actualUrl} color="#a855f7" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    actualUrl,
                    actualUrl.substring(actualUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Download Original
              </button>
            </div>
          </div>
        )}
        {vocalsUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Vocals
            </h2>
            <WaveformPlayer audioUrl={vocalsUrl} color="#0d56b5" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    vocalsUrl,
                    vocalsUrl.substring(vocalsUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-blue-700 transition-colors "
              >
                Download Vocals
              </button>
            </div>
          </div>
        )}
        {guitarUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Guitar
            </h2>
            <WaveformPlayer audioUrl={guitarUrl} color="#f43f5e" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    guitarUrl,
                    guitarUrl.substring(guitarUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-rose-700 transition-colors"
              >
                Download Guitar
              </button>
            </div>
          </div>
        )}

        {drumsUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Drums
            </h2>
            <WaveformPlayer audioUrl={drumsUrl} color="#10b981" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    drumsUrl,
                    drumsUrl.substring(drumsUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
              >
                Download Drums
              </button>
            </div>
          </div>
        )}

        {otherUrl && (
          <div className="p-6 bg-white rounded-xl border-2 border-black w-full max-w-sm shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Other
            </h2>
            <WaveformPlayer audioUrl={otherUrl} color="#a855f7" />
            <div className="text-left mt-4">
              <button
                onClick={() =>
                  handleDownload(
                    otherUrl,
                    otherUrl.substring(otherUrl.lastIndexOf("/") + 1)
                  )
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Download Other
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
