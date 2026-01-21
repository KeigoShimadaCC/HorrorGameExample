import { GameState } from '@/app/types';

export interface Ending {
    id: string;
    name: string;
    conditions: {
        sanityRange?: [number, number]; // [min, max]
        requiredFlags?: string[];
        requiredItems?: string[];
        forbiddenFlags?: string[];
    };
    priority: number; // Higher = checked first
}

export const ENDINGS: Ending[] = [
    {
        id: "ritual_bargain",
        name: "Ritual Bargain",
        conditions: {
            requiredFlags: ["performed_ritual"]
        },
        priority: 120,
    },
    {
        id: "escape_true",
        name: "True Escape",
        conditions: {
            sanityRange: [40, 100],
            requiredFlags: ["found_car_keys", "found_shrine_map", "got_outside"]
        },
        priority: 110,
    },
    {
        id: "cosmic_truth",
        name: "You Understood the Abyss",
        conditions: {
            requiredFlags: ["read_forbidden_book", "learned_covenant", "seen_entity_origin"]
        },
        priority: 100,
    },
    {
        id: "consumed",
        name: "Consumed",
        conditions: {
            sanityRange: [0, 0]
        },
        priority: 90,
    },
    {
        id: "escape_broken",
        name: "Escaped, But...",
        conditions: {
            sanityRange: [1, 30],
            requiredFlags: ["found_car_keys"],
            forbiddenFlags: ["read_forbidden_book"]
        },
        priority: 80,
    },
    {
        id: "sealed_in",
        name: "Sealed In",
        conditions: {
            sanityRange: [1, 20],
            requiredFlags: ["sealed_hallway"],
            forbiddenFlags: ["got_outside"]
        },
        priority: 75,
    },
    {
        id: "escape_clean",
        name: "Dawn",
        conditions: {
            sanityRange: [60, 100],
            requiredFlags: ["found_car_keys", "survived_until_dawn"]
        },
        priority: 70,
    }
];

export const checkEndingConditions = (gameState: GameState): Ending | null => {
    // Sort by priority
    const sortedEndings = [...ENDINGS].sort((a, b) => b.priority - a.priority);

    for (const ending of sortedEndings) {
        const { conditions } = ending;
        let match = true;

        // Sanity Check
        if (conditions.sanityRange) {
            const [min, max] = conditions.sanityRange;
            if (gameState.sanity < min || gameState.sanity > max) match = false;
        }

        // Required Flags Check
        if (match && conditions.requiredFlags) {
            for (const flag of conditions.requiredFlags) {
                if (!gameState.flags[flag]) {
                    match = false;
                    break;
                }
            }
        }

        // Forbidden Flags Check
        if (match && conditions.forbiddenFlags) {
            for (const flag of conditions.forbiddenFlags) {
                if (gameState.flags[flag]) {
                    match = false;
                    break;
                }
            }
        }

        // Required Items Check
        if (match && conditions.requiredItems) {
            for (const item of conditions.requiredItems) {
                if (!gameState.inventory.includes(item)) {
                    match = false;
                    break;
                }
            }
        }

        if (match) return ending;
    }

    return null;
};
