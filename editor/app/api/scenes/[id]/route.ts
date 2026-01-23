import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SCENES_DIR = path.resolve(process.cwd(), "..", "data", "scenes");

const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const safeId = sanitizeId(params.id);
  if (!safeId) {
    return NextResponse.json({ error: "Invalid scene id" }, { status: 400 });
  }
  const filePath = path.join(SCENES_DIR, `${safeId}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return NextResponse.json({ scene: JSON.parse(raw) });
  } catch (error) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const safeId = sanitizeId(params.id);
  if (!safeId) {
    return NextResponse.json({ error: "Invalid scene id" }, { status: 400 });
  }
  const filePath = path.join(SCENES_DIR, `${safeId}.json`);
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid scene payload" }, { status: 400 });
    }
    if (!body.id) {
      body.id = safeId;
    }
    await writeFile(filePath, JSON.stringify(body, null, 4) + "\n", "utf-8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save scene" }, { status: 500 });
  }
}
