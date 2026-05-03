import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file" },
        { status: 400 }
      );
    }

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/separate/multi", {
      method: "POST",
      body: form,
    });

    console.log("FastAPI status:", res.status);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend error:", errText);

      return NextResponse.json(
        { error: "FastAPI failed", details: errText },
        { status: res.status }
      );
    }

    // -----------------------------
    // 🔥 CRITICAL FIX: robust binary read
    // -----------------------------
    const buffer = Buffer.from(await res.arrayBuffer());

    console.log("Received size:", buffer.length);

    // -----------------------------
    // 🧪 ZIP validation guard
    // -----------------------------
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;

    if (!isZip) {
      console.error("NOT A ZIP RESPONSE");
      console.error("Raw response preview:", buffer.toString("utf-8"));

      return NextResponse.json(
        {
          error: "Backend did not return a valid ZIP",
          preview: buffer.toString("utf-8").slice(0, 200),
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // ZIP parsing
    // -----------------------------
    const zip = await JSZip.loadAsync(buffer);

    const vocalFile = zip.file("vocals.wav");
    const guitarFile = zip.file("guitar.wav");
    const drumsFile = zip.file("drums.wav");
    const otherFile = zip.file("other.wav");

    if (!vocalFile || !guitarFile || !drumsFile || !otherFile) {
      console.error("ZIP contents:", Object.keys(zip.files));

      return NextResponse.json(
        { error: "Missing expected audio files in ZIP" },
        { status: 500 }
      );
    }

    const [vocal, guitar, drums, other] = await Promise.all([
      vocalFile.async("nodebuffer"),
      guitarFile.async("nodebuffer"),
      drumsFile.async("nodebuffer"),
      otherFile.async("nodebuffer"),
    ]);

    const publicDir = path.join(process.cwd(), "public");
    const t = Date.now();

    const files = {
      vocal: `vocals-${t}.wav`,
      guitar: `guitar-${t}.wav`,
      drums: `drums-${t}.wav`,
      other: `other-${t}.wav`,
      original: `original-${t}.wav`,
    };

    await Promise.all([
      fs.writeFile(path.join(publicDir, files.vocal), vocal),
      fs.writeFile(path.join(publicDir, files.guitar), guitar),
      fs.writeFile(path.join(publicDir, files.drums), drums),
      fs.writeFile(path.join(publicDir, files.other), other),
      fs.writeFile(
        path.join(publicDir, files.original),
        Buffer.from(await file.arrayBuffer())
      ),
    ]);

    return NextResponse.json({
      message: "Success",
      vocalUrl: `/${files.vocal}`,
      guitarUrl: `/${files.guitar}`,
      drumsUrl: `/${files.drums}`,
      otherUrl: `/${files.other}`,
      actualUrl: `/${files.original}`,
    });
  } catch (err: any) {
    console.error("Route error:", err);

    return NextResponse.json(
      {
        error: "Unexpected failure",
        details: err.message,
      },
      { status: 500 }
    );
  }
}