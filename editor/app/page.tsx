"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Rect = { x: number; y: number; width: number; height: number };

type Interactable = {
  id: string;
  label: string;
  rect: Rect;
  examineText: string;
  examineTextLowSanity?: string;
  requiredFlag?: string;
  requiredItem?: string;
  givesItem?: string;
  setsFlag?: string;
  storyFlag?: string;
  lockedText?: string;
};

type Navigation = {
  targetSceneId: string;
  label: string;
  position: Rect;
  requiredFlag?: string;
  lockedText?: string;
};

type SceneData = {
  id: string;
  name: string;
  backgroundImage: string;
  backgroundImageLowSanity?: string;
  ambientAudio: string;
  interactables: Interactable[];
  navigation: Navigation[];
};

type DragAction = {
  kind: "interactable" | "navigation";
  index: number;
  mode: "move" | "resize";
  handle?: "nw" | "ne" | "sw" | "se";
  startX: number;
  startY: number;
  startRect: Rect;
  aspect: number;
};

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export default function EditorPage() {
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string>("");
  const [scene, setScene] = useState<SceneData | null>(null);
  const [ghostScene, setGhostScene] = useState<SceneData | null>(null);
  const [selected, setSelected] = useState<{ kind: "interactable" | "navigation"; index: number } | null>(null);
  const [showInteractables, setShowInteractables] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [useLowSanityBg, setUseLowSanityBg] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showGhost, setShowGhost] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragAction | null>(null);
  const skipSaveRef = useRef(true);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/scenes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.scenes)) {
          setScenes(data.scenes);
          if (data.scenes[0]) {
            setActiveSceneId(data.scenes[0].id);
          }
        }
      })
      .catch(() => {
        setScenes([]);
      });
  }, []);

  useEffect(() => {
    if (!activeSceneId) return;
    fetch(`/api/scenes/${activeSceneId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.scene) {
          setScene(data.scene);
          setGhostScene(data.scene);
          setSelected(null);
          skipSaveRef.current = true;
          setSaveStatus("idle");
        }
      })
      .catch(() => {
        setScene(null);
      });
  }, [activeSceneId]);

  const bgPath = useMemo(() => {
    if (!scene) return "";
    const path = useLowSanityBg && scene.backgroundImageLowSanity
      ? scene.backgroundImageLowSanity
      : scene.backgroundImage;
    return path ? `/api/asset?path=${encodeURIComponent(path)}` : "";
  }, [scene, useLowSanityBg]);

  const updateRect = useCallback(
    (kind: "interactable" | "navigation", index: number, rect: Rect) => {
      if (!scene) return;
      const next = { ...scene };
      if (kind === "interactable") {
        next.interactables = [...scene.interactables];
        next.interactables[index] = { ...next.interactables[index], rect };
      } else {
        next.navigation = [...scene.navigation];
        next.navigation[index] = { ...next.navigation[index], position: rect };
      }
      setScene(next);
    },
    [scene]
  );

  const startDrag = (
    event: React.MouseEvent,
    kind: "interactable" | "navigation",
    index: number,
    mode: "move" | "resize",
    handle?: DragAction["handle"]
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!scene || !containerRef.current) return;
    const rect = kind === "interactable"
      ? scene.interactables[index].rect
      : scene.navigation[index].position;
    dragRef.current = {
      kind,
      index,
      mode,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startRect: { ...rect },
      aspect: rect.width / Math.max(1, rect.height),
    };
    setSelected({ kind, index });
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const action = dragRef.current;
      if (!action || !containerRef.current || !scene) return;
      const bounds = containerRef.current.getBoundingClientRect();
      const dx = ((event.clientX - action.startX) / bounds.width) * 100;
      const dy = ((event.clientY - action.startY) / bounds.height) * 100;

      let next = { ...action.startRect };
      const minSize = 2;

      if (action.mode === "move") {
        next.x = clamp(action.startRect.x + dx, 0, 100 - action.startRect.width);
        next.y = clamp(action.startRect.y + dy, 0, 100 - action.startRect.height);
      } else {
        const handle = action.handle || "se";
        let newX = action.startRect.x;
        let newY = action.startRect.y;
        let newW = action.startRect.width;
        let newH = action.startRect.height;

        if (handle.includes("e")) {
          newW = clamp(action.startRect.width + dx, minSize, 100 - action.startRect.x);
        }
        if (handle.includes("s")) {
          newH = clamp(action.startRect.height + dy, minSize, 100 - action.startRect.y);
        }
        if (handle.includes("w")) {
          newW = clamp(action.startRect.width - dx, minSize, action.startRect.x + action.startRect.width);
          newX = clamp(action.startRect.x + dx, 0, action.startRect.x + action.startRect.width - minSize);
        }
        if (handle.includes("n")) {
          newH = clamp(action.startRect.height - dy, minSize, action.startRect.y + action.startRect.height);
          newY = clamp(action.startRect.y + dy, 0, action.startRect.y + action.startRect.height - minSize);
        }

        if (event.shiftKey) {
          const ratio = action.aspect || 1;
          if (newW / newH > ratio) {
            newW = newH * ratio;
          } else {
            newH = newW / ratio;
          }
        }

        next = { x: newX, y: newY, width: newW, height: newH };
      }

      if (snapToGrid) {
        next = {
          x: Math.round(next.x),
          y: Math.round(next.y),
          width: Math.round(next.width),
          height: Math.round(next.height),
        };
      }

      updateRect(action.kind, action.index, next);
    };

    const handleUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [scene, snapToGrid, updateRect]);

  const saveScene = useCallback(async () => {
    if (!scene) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/scenes/${scene.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scene),
      });
      if (!res.ok) throw new Error("save failed");
      setGhostScene(scene);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    } catch {
      setSaveStatus("error");
    }
  }, [scene]);

  useEffect(() => {
    if (!scene) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      saveScene();
    }, 600);
  }, [scene, saveScene]);

  const selectionData = useMemo(() => {
    if (!scene || !selected) return null;
    return selected.kind === "interactable"
      ? scene.interactables[selected.index]
      : scene.navigation[selected.index];
  }, [scene, selected]);

  const diffLines = useMemo(() => {
    if (!scene || !ghostScene) return [];
    const current = JSON.stringify(scene, null, 4).split("\n");
    const saved = JSON.stringify(ghostScene, null, 4).split("\n");
    const max = Math.max(current.length, saved.length);
    const lines: { type: "same" | "add" | "remove"; text: string }[] = [];
    for (let i = 0; i < max; i += 1) {
      const a = saved[i];
      const b = current[i];
      if (a === b && a !== undefined) {
        lines.push({ type: "same", text: `  ${a}` });
      } else {
        if (a !== undefined) lines.push({ type: "remove", text: `- ${a}` });
        if (b !== undefined) lines.push({ type: "add", text: `+ ${b}` });
      }
    }
    return lines;
  }, [scene, ghostScene]);

  const updateSelectionField = (field: string, value: string) => {
    if (!scene || !selected) return;
    const next = { ...scene };
    if (selected.kind === "interactable") {
      const item = { ...next.interactables[selected.index] } as Interactable;
      (item as any)[field] = value;
      next.interactables = [...next.interactables];
      next.interactables[selected.index] = item;
    } else {
      const nav = { ...next.navigation[selected.index] } as Navigation;
      (nav as any)[field] = value;
      next.navigation = [...next.navigation];
      next.navigation[selected.index] = nav;
    }
    setScene(next);
  };

  const updateSelectionRectField = (field: keyof Rect, value: number) => {
    if (!scene || !selected) return;
    const rect = selected.kind === "interactable"
      ? scene.interactables[selected.index].rect
      : scene.navigation[selected.index].position;
    const nextRect = { ...rect, [field]: value };
    updateRect(selected.kind, selected.index, nextRect);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", height: "100vh" }}>
      <aside style={{ borderRight: "1px solid #222", padding: "14px", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Scenes</h3>
        {scenes.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSceneId(item.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginBottom: 8,
              background: activeSceneId === item.id ? "#2a2a34" : undefined,
            }}
          >
            {item.name || item.id}
          </button>
        ))}
      </aside>

      <main style={{ padding: "12px", position: "relative" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <strong>{scene ? scene.name : "Loading..."}</strong>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={showInteractables} onChange={(e) => setShowInteractables(e.target.checked)} />
            Interactables
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={showNavigation} onChange={(e) => setShowNavigation(e.target.checked)} />
            Navigation
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
            Snap 1%
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={showGhost} onChange={(e) => setShowGhost(e.target.checked)} />
            Ghost overlay
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={useLowSanityBg} onChange={(e) => setUseLowSanityBg(e.target.checked)} />
            Low-sanity BG
          </label>
          <button onClick={saveScene}>Save Now</button>
          <button onClick={() => setShowDiff(true)}>Diff</button>
          <span style={{ fontSize: 12, color: saveStatus === "error" ? "#ff6b6b" : "#a0a0a0" }}>
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>
        </div>

        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 90px)",
            border: "1px solid #222",
            background: bgPath ? `url(${bgPath}) center/contain no-repeat` : "#111",
          }}
          onMouseDown={() => setSelected(null)}
        >
          {scene && ghostScene && showGhost && (
            <>
              {showInteractables && ghostScene.interactables.map((item) => (
                <div
                  key={`ghost-interactable-${item.id}`}
                  style={{
                    position: "absolute",
                    left: `${item.rect.x}%`,
                    top: `${item.rect.y}%`,
                    width: `${item.rect.width}%`,
                    height: `${item.rect.height}%`,
                    border: "1px dashed rgba(148, 163, 184, 0.6)",
                    background: "rgba(59, 130, 246, 0.06)",
                    pointerEvents: "none",
                  }}
                />
              ))}
              {showNavigation && ghostScene.navigation.map((nav, index) => (
                <div
                  key={`ghost-nav-${index}`}
                  style={{
                    position: "absolute",
                    left: `${nav.position.x}%`,
                    top: `${nav.position.y}%`,
                    width: `${nav.position.width}%`,
                    height: `${nav.position.height}%`,
                    border: "1px dashed rgba(250, 204, 21, 0.5)",
                    background: "rgba(250, 204, 21, 0.05)",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </>
          )}
          {scene && showInteractables && scene.interactables.map((item, index) => {
            const isSelected = selected?.kind === "interactable" && selected.index === index;
            return (
              <div
                key={item.id}
                onMouseDown={(event) => startDrag(event, "interactable", index, "move")}
                style={{
                  position: "absolute",
                  left: `${item.rect.x}%`,
                  top: `${item.rect.y}%`,
                  width: `${item.rect.width}%`,
                  height: `${item.rect.height}%`,
                  border: `1px solid ${isSelected ? "#f87171" : "#6b7280"}`,
                  background: "rgba(80, 80, 90, 0.18)",
                }}
              >
                <div style={{ fontSize: 10, padding: "2px 4px" }}>{item.label}</div>
                {isSelected && ["nw", "ne", "sw", "se"].map((handle) => (
                  <div
                    key={handle}
                    onMouseDown={(event) => startDrag(event, "interactable", index, "resize", handle as DragAction["handle"])}
                    style={{
                      position: "absolute",
                      width: 10,
                      height: 10,
                      background: "#f87171",
                      ...(handle.includes("n") ? { top: -5 } : { bottom: -5 }),
                      ...(handle.includes("w") ? { left: -5 } : { right: -5 }),
                      cursor: `${handle}-resize`,
                    }}
                  />
                ))}
              </div>
            );
          })}

          {scene && showNavigation && scene.navigation.map((nav, index) => {
            const isSelected = selected?.kind === "navigation" && selected.index === index;
            return (
              <div
                key={`${nav.targetSceneId}-${index}`}
                onMouseDown={(event) => startDrag(event, "navigation", index, "move")}
                style={{
                  position: "absolute",
                  left: `${nav.position.x}%`,
                  top: `${nav.position.y}%`,
                  width: `${nav.position.width}%`,
                  height: `${nav.position.height}%`,
                  border: `1px dashed ${isSelected ? "#facc15" : "#94a3b8"}`,
                  background: "rgba(200, 160, 80, 0.12)",
                }}
              >
                <div style={{ fontSize: 10, padding: "2px 4px" }}>{nav.label}</div>
                {isSelected && ["nw", "ne", "sw", "se"].map((handle) => (
                  <div
                    key={handle}
                    onMouseDown={(event) => startDrag(event, "navigation", index, "resize", handle as DragAction["handle"])}
                    style={{
                      position: "absolute",
                      width: 10,
                      height: 10,
                      background: "#facc15",
                      ...(handle.includes("n") ? { top: -5 } : { bottom: -5 }),
                      ...(handle.includes("w") ? { left: -5 } : { right: -5 }),
                      cursor: `${handle}-resize`,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <aside style={{ borderLeft: "1px solid #222", padding: "14px", overflowY: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Inspector</h3>
        {!selectionData && <p style={{ color: "#9ca3af" }}>Select a box to edit.</p>}
        {selectionData && selected?.kind === "interactable" && (
          <>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Interactable</div>
            <label style={{ display: "block", marginTop: 8 }}>
              Label
              <input
                value={(selectionData as Interactable).label}
                onChange={(e) => updateSelectionField("label", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>
            <label style={{ display: "block", marginTop: 8 }}>
              Examine Text
              <textarea
                value={(selectionData as Interactable).examineText}
                onChange={(e) => updateSelectionField("examineText", e.target.value)}
                rows={4}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>
            <label style={{ display: "block", marginTop: 8 }}>
              Low Sanity Text
              <textarea
                value={(selectionData as Interactable).examineTextLowSanity || ""}
                onChange={(e) => updateSelectionField("examineTextLowSanity", e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>
          </>
        )}
        {selectionData && selected?.kind === "navigation" && (
          <>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Navigation</div>
            <label style={{ display: "block", marginTop: 8 }}>
              Label
              <input
                value={(selectionData as Navigation).label}
                onChange={(e) => updateSelectionField("label", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>
            <label style={{ display: "block", marginTop: 8 }}>
              Target Scene ID
              <input
                value={(selectionData as Navigation).targetSceneId}
                onChange={(e) => updateSelectionField("targetSceneId", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>
          </>
        )}

        {selectionData && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Rect</div>
            {(["x", "y", "width", "height"] as const).map((field) => {
              const rect = selected?.kind === "interactable"
                ? (selectionData as Interactable).rect
                : (selectionData as Navigation).position;
              return (
                <label key={field} style={{ display: "block", marginTop: 6 }}>
                  {field}
                  <input
                    type="number"
                    value={rect[field]}
                    onChange={(e) => updateSelectionRectField(field, Number(e.target.value))}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </label>
              );
            })}
          </div>
        )}
      </aside>
      {showDiff && (
        <div
          onMouseDown={() => setShowDiff(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(900px, 90vw)",
              maxHeight: "80vh",
              overflow: "auto",
              background: "#0f0f13",
              border: "1px solid #2b2b2f",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Diff Preview</strong>
              <button onClick={() => setShowDiff(false)}>Close</button>
            </div>
            <pre style={{ marginTop: 12, fontSize: 11, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>
              {diffLines.map((line, index) => (
                <div
                  key={`${line.type}-${index}`}
                  style={{
                    color:
                      line.type === "add"
                        ? "#86efac"
                        : line.type === "remove"
                        ? "#fca5a5"
                        : "#9ca3af",
                  }}
                >
                  {line.text}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
