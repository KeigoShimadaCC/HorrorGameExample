import json
import re
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCENES_DIR = ROOT / "data" / "scenes"
ITEMS_PATH = ROOT / "app" / "lib" / "items.ts"
ENDINGS_PATH = ROOT / "app" / "lib" / "endings.ts"
AUDIO_PATH = ROOT / "app" / "hooks" / "useAudio.tsx"
PUBLIC_DIR = ROOT / "public"


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return exc


def extract_strings_in_arrays(text, label):
    pattern = rf"{label}\s*:\s*\[([^\]]*)\]"
    results = []
    for match in re.finditer(pattern, text, re.MULTILINE | re.DOTALL):
        body = match.group(1)
        results.extend(re.findall(r'"([^"]+)"', body))
    return results


def main():
    errors = []
    warnings = []

    # Load scenes
    scenes = {}
    for path in SCENES_DIR.glob("*.json"):
        data = load_json(path)
        if isinstance(data, Exception):
            errors.append(f"JSON parse error: {path.name}: {data}")
            continue
        if not isinstance(data, dict) or "id" not in data:
            errors.append(f"Invalid scene file: {path.name}: missing id")
            continue
        sid = data["id"]
        if sid in scenes:
            errors.append(f"Duplicate scene id: {sid} in {path.name}")
        scenes[sid] = (path, data)

    # Extract items
    item_text = ITEMS_PATH.read_text(encoding="utf-8")
    item_ids = set(re.findall(r'id:\s*"([^"]+)"', item_text))

    # Extract endings
    endings_text = ENDINGS_PATH.read_text(encoding="utf-8")
    endings_required_flags = set(extract_strings_in_arrays(endings_text, "requiredFlags"))
    endings_forbidden_flags = set(extract_strings_in_arrays(endings_text, "forbiddenFlags"))
    endings_required_items = set(extract_strings_in_arrays(endings_text, "requiredItems"))

    # Extract audio manifest keys
    audio_text = AUDIO_PATH.read_text(encoding="utf-8")
    manifest_keys = set(re.findall(r'"([^"]+)"\s*:\s*\{\s*file:', audio_text))

    flags_set = set()
    flags_used = set()
    flags_set_implicit = set()

    # Flags set outside scene data
    flags_set_implicit.add("survived_until_dawn")

    # Validate scenes
    for sid, (path, data) in scenes.items():
        # Background images
        for key in ("backgroundImage", "backgroundImageLowSanity"):
            val = data.get(key)
            if isinstance(val, str) and val.startswith("/images/"):
                fs_path = PUBLIC_DIR / val.lstrip("/")
                if not fs_path.exists():
                    warnings.append(f"{path.name}: missing image file for {key}: {val}")

        # Navigation targets
        for nav in data.get("navigation", []) or []:
            target = nav.get("targetSceneId")
            if not target:
                errors.append(f"{path.name}: navigation missing targetSceneId")
                continue
            if target not in scenes:
                errors.append(f"{path.name}: navigation target missing scene: {target}")
            if nav.get("requiredFlag"):
                flags_used.add(nav["requiredFlag"])

        # Events
        events = data.get("events", []) or []
        event_ids = set()
        for ev in events:
            eid = ev.get("id")
            if not eid:
                errors.append(f"{path.name}: event missing id")
                continue
            if eid in event_ids:
                errors.append(f"{path.name}: duplicate event id: {eid}")
            event_ids.add(eid)
            trigger = ev.get("trigger")
            if trigger == "on_storyFlag" and not ev.get("flag"):
                errors.append(f"{path.name}: on_storyFlag event missing flag: {eid}")
            if trigger == "on_timer" and not ev.get("timerDuration"):
                warnings.append(f"{path.name}: on_timer event missing timerDuration: {eid}")
            if trigger == "on_sanity_threshold" and ev.get("sanityThreshold") is None:
                errors.append(f"{path.name}: on_sanity_threshold missing sanityThreshold: {eid}")
            if ev.get("teleportTo") and ev.get("teleportTo") not in scenes:
                errors.append(f"{path.name}: teleportTo missing scene: {ev.get('teleportTo')}")
            if ev.get("flag"):
                flags_set.add(ev["flag"])
            if ev.get("blockedByFlag"):
                flags_used.add(ev["blockedByFlag"])
            if ev.get("requires", {}).get("storyFlag"):
                flags_used.add(ev["requires"]["storyFlag"])
            if ev.get("audio"):
                audio_key = ev["audio"]
                if isinstance(audio_key, str):
                    if audio_key.startswith("/"):
                        warnings.append(f"{path.name}: raw audio path used: {audio_key}")
                    elif audio_key not in manifest_keys:
                        warnings.append(f"{path.name}: audio key not in manifest: {audio_key}")

        # Interactables
        for item in data.get("interactables", []) or []:
            if "id" not in item:
                errors.append(f"{path.name}: interactable missing id")
                continue
            if "rect" not in item:
                errors.append(f"{path.name}: interactable missing rect: {item.get('id')}")
            if item.get("triggerEvent") and item.get("triggerEvent") not in event_ids:
                errors.append(f"{path.name}: triggerEvent not found: {item.get('triggerEvent')}")
            if item.get("requiredItem") and item.get("requiredItem") not in item_ids:
                warnings.append(f"{path.name}: requiredItem not found in items: {item.get('requiredItem')}")
            if item.get("givesItem") and item.get("givesItem") not in item_ids:
                warnings.append(f"{path.name}: givesItem not found in items: {item.get('givesItem')}")
            if item.get("requiredFlag"):
                flags_used.add(item["requiredFlag"])
            if item.get("forbiddenFlag"):
                flags_used.add(item["forbiddenFlag"])
            if item.get("forbiddenFlags"):
                flags_used.update(item["forbiddenFlags"])
            if item.get("setsFlag"):
                flags_set.add(item["setsFlag"])
            if item.get("storyFlag"):
                flags_set.add(item["storyFlag"])
            if item.get("audioTrigger"):
                audio_key = item["audioTrigger"]
                if isinstance(audio_key, str):
                    if audio_key.startswith("/"):
                        warnings.append(f"{path.name}: raw audio path used: {audio_key}")
                    elif audio_key not in manifest_keys:
                        warnings.append(f"{path.name}: audio key not in manifest: {audio_key}")

        # Scene ambient audio
        if data.get("ambientAudio"):
            audio_key = data["ambientAudio"]
            if isinstance(audio_key, str):
                if audio_key.startswith("/"):
                    warnings.append(f"{path.name}: raw audio path used: {audio_key}")
                elif audio_key not in manifest_keys:
                    warnings.append(f"{path.name}: audio key not in manifest: {audio_key}")

    # Ending references
    for flag in endings_required_flags | endings_forbidden_flags:
        if flag in flags_set_implicit:
            flags_used.add(flag)
            continue
        if flag not in flags_set and flag not in flags_used:
            warnings.append(f"endings: flag referenced but never set/used: {flag}")
        flags_used.add(flag)

    for item in endings_required_items:
        if item not in item_ids:
            warnings.append(f"endings: requiredItem not found in items: {item}")

    # Unused flags (set but never used)
    for flag in sorted((flags_set | flags_set_implicit) - flags_used):
        warnings.append(f"flag set but never used: {flag}")

    # Report
    if errors:
        print("Errors:")
        for e in errors:
            print(f"- {e}")
    if warnings:
        print("Warnings:")
        for w in warnings:
            print(f"- {w}")

    if errors:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
