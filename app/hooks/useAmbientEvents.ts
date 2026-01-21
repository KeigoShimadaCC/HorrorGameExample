import { useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/app/hooks/useGameState';
import { AMBIENT_EVENTS } from '@/app/data/ambientEvents';
import { HorrorEvent } from '@/app/types';

export const useAmbientEvents = (
    onTriggerEvent: (event: HorrorEvent) => void
) => {
    const { sanity, flags, resetCount } = useGameState();
    const sanityRef = useRef(sanity);
    const flagsRef = useRef(flags);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

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

    useEffect(() => {
        sanityRef.current = sanity;
    }, [sanity]);

    useEffect(() => {
        flagsRef.current = flags;
    }, [flags]);

    useEffect(() => {
        triggeredSessionEventsRef.current.clear();
        lastTriggeredRef.current = {};
    }, [resetCount]);

    // Timer-based ambient events (per-event cadence)
    useEffect(() => {
        timersRef.current.forEach(clearInterval);
        timersRef.current = [];

        AMBIENT_EVENTS.forEach((event) => {
            if (event.trigger !== 'on_timer') return;
            const intervalMs = (event.timerDuration || 60) * 1000;
            const timer = setInterval(() => {
                const now = Date.now();
                const currentSanity = sanityRef.current;
                const currentFlags = flagsRef.current;

                if (event.blockedByFlag && currentFlags[event.blockedByFlag]) return;
                if (event.oneTime && triggeredSessionEventsRef.current.has(event.id)) return;
                if (event.requires?.sanityBelow && currentSanity >= event.requires.sanityBelow) return;

                if (event.cooldown) {
                    const last = lastTriggeredRef.current[event.id] || 0;
                    if (now - last < event.cooldown * 1000) return;
                }

                if (Math.random() > 0.3) return;

                fireEvent(event);
            }, intervalMs);

            timersRef.current.push(timer);
        });

        return () => {
            timersRef.current.forEach(clearInterval);
            timersRef.current = [];
        };
    }, [fireEvent]);

    // Check Sanity Threshold Events
    useEffect(() => {
        AMBIENT_EVENTS.forEach(event => {
            if (event.trigger !== 'on_sanity_threshold') return;
            if (event.blockedByFlag && flags[event.blockedByFlag]) return;
            if (event.oneTime && triggeredSessionEventsRef.current.has(event.id)) return;

            if (event.sanityThreshold && sanity <= event.sanityThreshold) {
                fireEvent(event);
            }
        });
    }, [sanity, flags, fireEvent]);
};
