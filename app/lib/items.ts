export interface ItemData {
    id: string;
    name: string;
    description: string;
    content?: string; // For documents/letters
    image?: string;
    onInspectFlag?: string; // Flag to set when inspected
}

export const ITEMS: Record<string, ItemData> = {
    grandmother_letter: {
        id: "grandmother_letter",
        name: "Grandmother's Letter",
        description: "A sealed envelope found in the mail pile. The handwriting is shaky.",
        content: `
      "My dearest,

      If you are reading this, I am already gone. Do not stay in this house. 
      The thing in the walls... it remembers us. It remembers the pact.
      
      I tried to seal the Hallway, but the salt lines are fading. 
      Do not look at the shadows for too long.
      Do not answer if they call your name.

      Leave. Leave now."
    `,
        onInspectFlag: "read_letter"
    },
    strange_shoes: {
        id: "strange_shoes",
        name: "Muddy Shoes",
        description: "You decided not to pick these up. They give you a bad feeling.",
        // Not picking up, just describing if we were to have it, but likely this stays in scene
    },
    rusty_knife: {
        id: "rusty_knife",
        name: "Rusty Knife",
        description: "A serrated knife covered in... rust? Or dried blood.",
        content: "It feels heavy in your hand."
    },
    car_keys: {
        id: "car_keys",
        name: "Car Keys",
        description: "Grandmother's keys, still cold from the night air.",
        content: "The metal teeth are wet, as if dipped in rainwater."
    },
    salt_pouch: {
        id: "salt_pouch",
        name: "Salt Pouch",
        description: "A small pouch of coarse salt. It feels heavier than it looks.",
        content: "The salt stings your fingers."
    },
    shrine_map: {
        id: "shrine_map",
        name: "Shrine Map",
        description: "A hand-drawn map marked with a path through the dunes.",
        content: "The map is damp, as if it was kept near the sea."
    },
    ritual_talisman: {
        id: "ritual_talisman",
        name: "Ritual Talisman",
        description: "A braided charm wrapped in old paper.",
        content: "The knots feel warm when you hold it."
    },
    old_key: {
        id: "old_key",
        name: "Old Key",
        description: "A tarnished key with a cracked wooden tag.",
        content: "The tag reads: 'Storage'."
    },
    flashlight: {
        id: "flashlight",
        name: "Flashlight",
        description: "A heavy flashlight with a fresh battery.",
        content: "The beam flickers once, then steadies."
    }
};

export const getItem = (id: string) => ITEMS[id];
