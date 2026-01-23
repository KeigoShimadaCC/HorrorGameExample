# Scene Editor (Dev Mode)

This is a dev-only scene editor for aligning hotspot rectangles with scene art and adjusting text without touching JSON by hand. It is intentionally separate from the main game so players never see it.

## Why This Exists
- Scene art and hotspot coordinates drift as assets change.
- Adjusting rectangles by hand is slow and error-prone.
- Fast iteration makes it easier to keep pacing and interaction flow tight.

## What You Can Do
- Load any scene from a sidebar list.
- View the scene background image (normal or low-sanity).
- See and edit **Interactables** and **Navigation** rectangles.
- Drag to move, drag corners to resize.
- Hold **Shift** while resizing to lock aspect ratio.
- Toggle **Snap 1%** for pixel-like alignment.
- Edit labels and key text fields in the Inspector.
- See a **Ghost overlay** of last saved positions.
- Preview a **diff** between saved JSON and current edits.
- Save instantly or rely on autosave.

## Saving Behavior
- Changes are autosaved ~600ms after edits stop.
- Click **Save Now** to force a write immediately.
- Save status appears in the toolbar: Saving / Saved / Failed.
- The **Ghost overlay** updates after a successful save.

## Run
1) `cd editor`
2) `npm install`
3) `npm run dev`
4) Open `http://localhost:3001`

## Where Changes Apply
- The editor reads/writes to `data/scenes/*.json` in the repo root.
- Images are loaded from `public/images/...` in the root project.
- Once saved, changes are effective immediately the next time the main game reloads.

## Notes
- This tool is for development only.
- Avoid running it in production builds or hosting it publicly.
