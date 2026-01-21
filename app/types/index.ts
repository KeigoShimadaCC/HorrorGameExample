export interface GameState {
    sanity: number;
    currentSceneId: string;
    inventory: string[];
    flags: Record<string, boolean>;
    events?: string[]; // Track triggered horror events
    time: number; // 0-100 representation of night progression
    resetCount?: number;
}

export interface Interactable {
    id: string;
    label: string;
    rect: { x: number; y: number; width: number; height: number };
    examineText: string;
    examineTextLowSanity?: string;
    sanityCost?: number;
    sanityRestore?: number;
    oneTime?: boolean;
    requiredItem?: string;
    givesItem?: string;
    setsFlag?: string;
    requiredFlag?: string;
    forbiddenFlag?: string;
    forbiddenFlags?: string[];
    lockedText?: string;
    audioTrigger?: string;
    triggerEvent?: string; // ID of event to trigger
    storyFlag?: string; // Flag to set upon interaction
    reveals?: string[]; // IDs of interactables to reveal
    requiresReveal?: boolean; // If true, initially hidden
}

export interface HorrorEvent {
    id: string;
    trigger: 'on_examine' | 'on_enter' | 'on_storyFlag' | 'on_timer' | 'on_sanity_threshold';

    // Trigger conditions
    targetId?: string;       // For on_examine
    flag?: string;           // For on_storyFlag
    delay?: number;          // ms
    sanityThreshold?: number;
    timerDuration?: number;  // seconds

    // Effects
    audio?: string;
    screenEffect?: 'flicker' | 'flicker_heavy' | 'flash_white' | 'flash_black' | 'shake' | 'static';
    sanityCost?: number;
    message?: string;
    teleportTo?: string;
    revealInteractable?: string;
    hideInteractable?: string;
    setsFlag?: string;

    // Control
    oneTime: boolean;
    requires?: { storyFlag?: string; item?: string; sanityBelow?: number; };
    blockedByFlag?: string;
    cooldown?: number; // seconds (for repeatable events)
}

export interface SceneData {
    id: string;
    name: string;
    backgroundImage: string;
    backgroundImageLowSanity?: string;
    interactables: Interactable[];
    ambientAudio: string;
    navigation: {
        targetSceneId: string;
        label: string;
        position: { x: number; y: number; width: number; height: number };
        requiredFlag?: string;
        lockedText?: string;
    }[];
    events?: HorrorEvent[]; // New: Scene-specific events
}
