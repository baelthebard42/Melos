import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), "public", filename as string);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(404).end("File not found");
    }

    res.setHeader("Content-Type", "audio/wav");
    res.send(data);
  });
}
