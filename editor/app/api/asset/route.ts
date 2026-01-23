import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const PUBLIC_DIR = path.resolve(process.cwd(), "..", "public");

const getContentType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetPath = searchParams.get("path");
  if (!assetPath || !assetPath.startsWith("/images/") || assetPath.includes("..")) {
    return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
  }

  const fullPath = path.join(PUBLIC_DIR, assetPath);
  try {
    const data = await readFile(fullPath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": getContentType(fullPath),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
}
