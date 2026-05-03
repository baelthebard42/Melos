import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import fssync from "fs";
import JSZip from "jszip";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file1 = formData.get("file1");
    const file2 = formData.get("file2");
    const file11 = formData.get("file1");
    const file22 = formData.get("file2");
    const modeRaw = formData.get("mode");
    const mode = typeof modeRaw === "string" ? modeRaw : "";

    if (
      !file1 ||
      !(file1 instanceof Blob) ||
      !file2 ||
      !(file2 instanceof Blob) ||
      !mode
    ) {
      return NextResponse.json(
        { error: "Missing or invalid file1, file2, or modeee" },
        { status: 400 }
      );
    }
    const splitForm = new FormData();
    splitForm.append("track", file1, "file1.wav");
    splitForm.append("mode", mode);

    const fastApiResponse = await fetch(
      `http://localhost:8000/karaoke-split/${mode}`,
      {
        method: "POST",
        body: splitForm,
      }
    );

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      throw new Error("Server Error: " + errorText);
    }

    const wavBlob = await fastApiResponse.blob();
    // const karaoke_file = URL.createObjectURL(wavBlob); optional
    // console.log("it received karaoke_file");

    const mergeForm = new FormData();
    mergeForm.append("track1", file2, "file2.wav");
    mergeForm.append("track2", wavBlob, "split.wav");

    const mergeResponse = await fetch("http://0.0.0.0:8000/karaoke-merge", {
      method: "POST",
      body: mergeForm,
    });

    const fileBlob = await mergeResponse.blob();

    const FileRemovedName = `remove${Date.now()}.wav`;

    const FileName11 = `file11.name-${Date.now()}.wav`;
    const FileName22 = `file.22name-${Date.now()}.wav`;
    const fileName = `karaoke_output-${Date.now()}.wav`;

    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, fileName);
    const FilePath11 = path.join(publicDir, FileName11);
    const FilePath22 = path.join(publicDir, FileName22);

    const FileRemovedPath = path.join(publicDir, FileRemovedName);

    // blob lai file jasari saved in publ.direc
    await fs.writeFile(filePath, Buffer.from(await fileBlob.arrayBuffer()));
    await fs.writeFile(FilePath11, Buffer.from(await file11.arrayBuffer()));
    await fs.writeFile(FilePath22, Buffer.from(await file22.arrayBuffer()));

    await fs.writeFile(
      FileRemovedPath,
      Buffer.from(await wavBlob.arrayBuffer())
    );

    const fileUrl = `/${fileName}`;
    const removeUrl = `/${FileRemovedName}`;

    ////
    const fileUrl11 = `/${FileName11}`;
    const fileUrl22 = `/${FileName22}`;

    console.log("File saved and URL generated:", fileUrl);

    return NextResponse.json({
      message: "Audio separation successful",
      fileUrl,
      fileUrl11,
      fileUrl22,
      removeUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/merge:", error);
    return NextResponse.json(
      { error: "Server error during merge process", details: error.message },
      { status: 500 }
    );
  }
}
