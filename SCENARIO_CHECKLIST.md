# Main Scenario Checklist

This file tracks the story-critical flags, items, scenes, and events currently implemented in the game. Use it as a live checklist for scenario completeness.

## Flags (Story Progress)
- `read_letter` - Set by inspecting the mail pile in entry hall. Implemented.
- `read_diary` - Set by diary in grandmother's room. Implemented.
- `learned_covenant` - Set by desk in study. Implemented.
- `read_forbidden_book` - Set by strange book in study. Implemented.
- `seen_entity_origin` - Set by turned photo in grandmother's room. Implemented.
- `found_car_keys` - Set by car keys in living room. Implemented.
- `found_salt_pouch` - Set by salt pouch in storage closet. Implemented.
- `sealed_hallway` - Set by using salt line in hallway. Implemented.
- `restored_power` - Set by breaker panel in utility room. Implemented.
- `answered_phone` - Set by phone in entry hall (requires power). Implemented.
- `ignored_phone` - Set by ignoring the phone (requires power). Implemented.
- `found_shrine_map` - Set by locked drawer in study. Implemented.
- `opened_fusuma` - Set by unlocking fusuma in hallway. Implemented.
- `saw_shadow_behind_you` - Set by TV in living room (requires power). Implemented.
- `performed_ritual` - Set by altar in hidden shrine. Implemented.
- `got_outside` - Set by car on outside porch. Implemented.
- `survived_until_dawn` - Auto-set by time progression in `GameCanvas` when time >= 100. Implemented.

## Items (Inventory)
- `grandmother_letter` - Entry hall mail pile. Implemented.
- `rusty_knife` - Kitchen table knife. Implemented.
- `car_keys` - Living room sofa keys. Implemented.
- `salt_pouch` - Storage closet. Implemented.
- `shrine_map` - Study drawer (requires old key). Implemented.
- `ritual_talisman` - Storage closet. Implemented.
- `old_key` - Entry hall coat rack. Implemented.
- `flashlight` - Utility room toolbox. Implemented.

## Scenes (Navigation + Critical Content)
- `entry_hall` - Entry; mail pile gate to hallway. Implemented.
- `hallway` - Hub; navigation to all rooms. Implemented.
- `kitchen` - Knife pickup. Implemented.
- `living_room` - Car keys. Implemented.
- `grandmothers_room` - Diary + origin photo. Implemented.
- `study` - Covenant + forbidden book. Implemented.
- `bathroom` - Mirror + bathtub scare (requires `seen_entity_origin`). Implemented.
- `utility_room` - Breaker panel + flashlight. Implemented.
- `storage_closet` - Salt pouch + talisman. Implemented.
- `outside_porch` - Car escape attempt + shrine path. Implemented.
- `hidden_shrine` - Ritual altar. Implemented.

## Events (Ambient + Scene)
Ambient events (global):
- `random_footsteps` - Timer-based sanity < 70. Implemented.
- `phone_ring` - Timer-based sanity < 60 (one-time). Implemented.
- `child_laughter` - Sanity threshold <= 40 (one-time). Implemented.
- `your_name_called` - Sanity threshold <= 25 (one-time). Implemented.
- `shadow_passes` - Timer-based sanity < 65 (blocked by `sealed_hallway`). Implemented.

Scene events:
- `futon_breath_sound` - Grandmother's room futon (on examine). Implemented.
- `clock_strikes` - Study desk (story flag). Implemented.
- `trigger_ending_truth` - Forbidden book (story flag). Implemented.
- `mirror_scare` - Bathroom mirror (on examine). Implemented.
- `bathtub_hand` - Bathroom tub (on examine, teleport). Implemented.
- `power_surge` - Utility room breaker panel (story flag). Implemented.
- `porch_pull` - Outside porch on enter (blocked by `found_shrine_map`). Implemented.

## Endings (Conditions)
- `cosmic_truth` - Requires `read_forbidden_book`, `learned_covenant`, `seen_entity_origin`. Implemented.
- `consumed` - Sanity = 0. Implemented.
- `escape_broken` - Sanity 1-30 + `found_car_keys` and NOT `read_forbidden_book`. Implemented.
- `escape_clean` - Sanity 60-100 + `found_car_keys` + `survived_until_dawn`. Implemented.
- `escape_true` - Sanity 40-100 + `found_car_keys` + `found_shrine_map` + `got_outside`. Implemented.
- `ritual_bargain` - `performed_ritual`. Implemented.
- `sealed_in` - Sanity 1-20 + `sealed_hallway` + NOT `got_outside`. Implemented.

## Gaps / To Verify
- Audio files are not in `public/audio/`; the system falls back to generated tones/noise.
- Several scene background images are placeholders using existing hallway/entry assets.
- Phone interaction is linear; no choice branch yet.

## Planned (Not Implemented Yet)
Events:
- `phone_choice` (answer/ignore path split)
- `entity_whisper` (on map pickup)
