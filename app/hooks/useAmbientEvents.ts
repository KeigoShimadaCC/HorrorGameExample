import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/app/hooks/useGameState';
import { AMBIENT_EVENTS } from '@/app/data/ambientEvents';
import { HorrorEvent } from '@/app/types';

export const useAmbientEvents = (
    onTriggerEvent: (event: HorrorEvent) => void
) => {
    const { sanity } = useGameState();

    // Track last triggered times for cooldowns
    const lastTriggeredRef = useRef<Record<string, number>>({});
    // Track one-time events that have fired during this session (separate from persistent GameState events)
    const triggeredSessionEventsRef = useRef<Set<string>>(new Set());

    // Stable trigger function
    const fireEvent = useCallback((event: HorrorEvent) => {
        console.log(`Triggering Ambient Event: ${event.id}`);

        lastTriggeredRef.current[event.id] = Date.now();
        if (event.oneTime) {
            triggeredSessionEventsRef.current.add(event.id);
        }

        // Pass to GameCanvas handler for side effects (text, etc)
        onTriggerEvent(event);
    }, [onTriggerEvent]);

    // Check Timer/Random Events
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();

            AMBIENT_EVENTS.forEach(event => {
                if (event.trigger !== 'on_timer') return;

                // One time check
                if (event.oneTime && triggeredSessionEventsRef.current.has(event.id)) return;

                // Sanity Requirement
                if (event.requires?.sanityBelow && sanity >= event.requires.sanityBelow) return;

                // Cooldown Check
                if (event.cooldown) {
                    const last = lastTriggeredRef.current[event.id] || 0;
                    if (now - last < event.cooldown * 1000) return;
                }

                // Random Chance (to avoid machine-like precision)
                if (Math.random() > 0.3) return; // 70% chance to SKIP per tick if conditions met, making it feel organic

                // Trigger
                fireEvent(event);

            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [sanity, fireEvent]);

    // Check Sanity Threshold Events
    useEffect(() => {
        AMBIENT_EVENTS.forEach(event => {
            if (event.trigger !== 'on_sanity_threshold') return;
            if (event.oneTime && triggeredSessionEventsRef.current.has(event.id)) return;

            if (event.sanityThreshold && sanity <= event.sanityThreshold) {
                fireEvent(event);
            }
        });
    }, [sanity, fireEvent]);
};
