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
    }
};

export const getItem = (id: string) => ITEMS[id];
