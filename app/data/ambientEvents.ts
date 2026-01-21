import { HorrorEvent } from '@/app/types';

export const AMBIENT_EVENTS: HorrorEvent[] = [
    {
        id: "random_footsteps",
        trigger: "on_timer",
        timerDuration: 45, // seconds
        audio: "footsteps_above",
        requires: { sanityBelow: 70 },
        oneTime: false, // Can repeat
        cooldown: 120 // Seconds before can trigger again
    },
    {
        id: "phone_ring",
        trigger: "on_timer",
        timerDuration: 90,
        audio: "old_phone_ring",
        message: "An old rotary phone rings somewhere in the house. You don't remember seeing a phone.",
        requires: { sanityBelow: 60 },
        oneTime: true
    },
    {
        id: "child_laughter",
        trigger: "on_sanity_threshold",
        sanityThreshold: 40,
        audio: "child_laugh_distant",
        oneTime: true
    },
    {
        id: "your_name_called",
        trigger: "on_sanity_threshold",
        sanityThreshold: 25,
        audio: "whisper_name",
        message: "Someone calls your name from the next room. The voice sounds like your grandmother.",
        oneTime: true
    }
];
