import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SCENES_DIR = path.resolve(process.cwd(), "..", "data", "scenes");

export async function GET() {
  try {
    const files = await readdir(SCENES_DIR);
    const items = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const raw = await readFile(path.join(SCENES_DIR, file), "utf-8");
          const data = JSON.parse(raw);
          return {
            id: data.id,
            name: data.name,
            backgroundImage: data.backgroundImage,
            backgroundImageLowSanity: data.backgroundImageLowSanity,
          };
        })
    );
    return NextResponse.json({ scenes: items });
  } catch (error) {
    return NextResponse.json({ scenes: [], error: "Failed to load scenes" }, { status: 500 });
  }
}
