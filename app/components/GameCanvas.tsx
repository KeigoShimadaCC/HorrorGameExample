'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from '@/app/hooks/useGameState';
import { useAudio } from '@/app/hooks/useAudio';
import { getAllScenes, getScene } from '@/app/lib/scenes';
import { DialogueBox } from './DialogueBox';
import { Interactable, HorrorEvent, SceneData } from '@/app/types';
import { motion } from 'framer-motion';
import { useAmbientEvents } from '@/app/hooks/useAmbientEvents';

export const GameCanvas = () => {
    const { currentSceneId, sanity, decreaseSanity, addItem, setFlag, flags, inventory, setScene, events, triggerEvent, advanceTime, time, setSanity } = useGameState();
    const { playAmbient, playSfx } = useAudio();
    const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
    const [sceneData, setSceneData] = useState(getScene(currentSceneId));

    // Timer refs for cleanup
    const eventTimers = useRef<NodeJS.Timeout[]>([]);

    // Helper to process an event's effects
    const processEvent = useCallback((event: HorrorEvent) => {
        if (event.oneTime && events?.includes(event.id)) return;
        if (event.trigger === 'on_sanity_threshold' && events?.includes(event.id)) return;
        if (event.blockedByFlag && flags[event.blockedByFlag]) return;

        // Check requirements
        if (event.requires) {
            if (event.requires.storyFlag && !flags[event.requires.storyFlag]) return;
            if (event.requires.item && !inventory.includes(event.requires.item)) return;
            if (event.requires.sanityBelow && sanity >= event.requires.sanityBelow) return;
        }

        // Apply Effects
        const executeEffects = () => {
            if (event.audio) playSfx(event.audio);
            if (event.sanityCost) decreaseSanity(event.sanityCost);
            if (event.message) setActiveDialogue(event.message);

            if (event.screenEffect) {
                console.log(`Triggering screen effect: ${event.screenEffect}`);
                // Future: Dispatch custom event for visual effects overlay
            }

            if (event.teleportTo) {
                setTimeout(() => setScene(event.teleportTo!), 500);
            }

            if (event.revealInteractable) {
                setFlag(`revealed_${event.revealInteractable}`, true);
            }
            if (event.hideInteractable) {
                setFlag(`hidden_${event.hideInteractable}`, true);
            }

            if (event.trigger === 'on_sanity_threshold' || event.oneTime) {
                triggerEvent(event.id);
            }
        };

        if (event.delay) {
            const timer = setTimeout(executeEffects, event.delay);
            eventTimers.current.push(timer);
        } else {
            executeEffects();
        }
    }, [events, flags, inventory, sanity, playSfx, decreaseSanity, setScene, triggerEvent, setFlag]);

    // Integrate Ambient Events
    useAmbientEvents(processEvent);


    // Update scene data when ID changes & Setup Trigger Monitors
    useEffect(() => {
        // Clear previous timers
        eventTimers.current.forEach(clearTimeout);
        eventTimers.current = [];

        const data = getScene(currentSceneId);
        setSceneData(data);

        if (data?.ambientAudio) {
            playAmbient(data.ambientAudio);
        }

        if (!data) return;

        // Process 'on_enter' events
        data.events?.filter(e => e.trigger === 'on_enter').forEach(processEvent);

        // Setup 'on_timer' events
        data.events?.filter(e => e.trigger === 'on_timer').forEach(e => {
            if (e.timerDuration) {
                const timer = setTimeout(() => processEvent(e), e.timerDuration * 1000);
                eventTimers.current.push(timer);
            }
        });

        // Cleanup function
        return () => {
            eventTimers.current.forEach(clearTimeout);
        };

    }, [currentSceneId, playAmbient, processEvent]);

    useEffect(() => {
        const scenes = getAllScenes();
        const sources = new Set<string>();
        scenes.forEach((scene) => {
            if (scene.backgroundImage) sources.add(scene.backgroundImage);
            if (scene.backgroundImageLowSanity) sources.add(scene.backgroundImageLowSanity);
        });
        sources.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, []);

    // Monitor Sanity & Flags for passive triggers
    useEffect(() => {
        if (!sceneData?.events) return;

        // on_sanity_threshold
        sceneData.events.filter(e => e.trigger === 'on_sanity_threshold').forEach(e => {
            if (e.sanityThreshold && sanity <= e.sanityThreshold) {
                processEvent(e);
            }
        });

        // on_storyFlag logic
        sceneData.events.filter(e => e.trigger === 'on_storyFlag').forEach(e => {
            if (e.flag && flags[e.flag]) {
                processEvent(e);
            }
        });

    }, [sanity, flags, sceneData, processEvent]);

    useEffect(() => {
        if (time >= 100 && !flags.survived_until_dawn) {
            setFlag('survived_until_dawn', true);
        }
    }, [time, flags.survived_until_dawn, setFlag]);


    // Handle Interaction
    const handleInteract = (item: Interactable) => {
        if (activeDialogue) return;

        // Check requirements
        if (item.forbiddenFlag && flags[item.forbiddenFlag]) return;
        if (item.forbiddenFlags && item.forbiddenFlags.some((flag) => flags[flag])) return;
        if (item.requiredFlag && !flags[item.requiredFlag]) {
            setActiveDialogue(item.lockedText || "Locked.");
            return;
        }
        if (item.requiredItem && !inventory.includes(item.requiredItem)) {
            setActiveDialogue(item.lockedText || "You need something to do that.");
            return;
        }
        if (item.oneTime && flags[`used_${item.id}`]) return;

        // Resolve Text (String or Object)
        let text = "";
        if (sanity < 50 && item.examineTextLowSanity) {
            text = item.examineTextLowSanity;
        } else {
            text = item.examineText;
        }

        // Sanity adjust (apply once, clamp)
        if (item.sanityCost || item.sanityRestore) {
            let nextSanity = sanity;
            if (item.sanityCost) {
                nextSanity = Math.max(0, nextSanity - item.sanityCost);
            }
            if (item.sanityRestore) {
                nextSanity = Math.min(100, nextSanity + item.sanityRestore);
            }
            if (nextSanity !== sanity) {
                setSanity(nextSanity);
            }
        }

        // Audio
        if (item.audioTrigger) {
            playSfx(item.audioTrigger);
        }

        setActiveDialogue(text);
        advanceTime(5);

        // Items/Flags
        if (item.givesItem && !inventory.includes(item.givesItem)) {
            addItem(item.givesItem);
        }
        if (item.setsFlag) {
            setFlag(item.setsFlag, true);
        }
        if (item.storyFlag) {
            setFlag(item.storyFlag, true);
        }
        if (item.oneTime) {
            setFlag(`used_${item.id}`, true);
        }

        // Handle Reveal Logic (for items that reveal others)
        if (item.reveals) {
            item.reveals.forEach(revealId => {
                setFlag(`revealed_${revealId}`, true);
            });
        }

        // Trigger Linked Event (support both 'triggerEvent' and legacy/alt 'event')
        const eventId = item.triggerEvent;
        const triggeredEventIds = new Set<string>();
        if (eventId && sceneData?.events) {
            const event = sceneData.events.find(e => e.id === eventId);
            if (event) {
                processEvent(event);
                triggeredEventIds.add(event.id);
            }
        }

        if (sceneData?.events) {
            sceneData.events
                .filter(e => e.trigger === 'on_examine' && e.targetId === item.id)
                .forEach(e => {
                    if (!triggeredEventIds.has(e.id)) {
                        processEvent(e);
                    }
                });
        }
    };


    const handleNavigation = (nav: SceneData['navigation'][0]) => {
        if (nav.requiredFlag && !flags[nav.requiredFlag]) {
            setActiveDialogue(nav.lockedText || "Locked.");
            playSfx('locked');
            return;
        }
        advanceTime(2);
        setScene(nav.targetSceneId);
    };

    // Determine Background Image
    const bgImage = (sanity < 40 && sceneData?.backgroundImageLowSanity)
        ? sceneData.backgroundImageLowSanity
        : sceneData?.backgroundImage;

    if (!sceneData) return <div className="text-faded text-center mt-20">Loading...</div>;

    const isLowSanity = sanity < 40;

    return (
        <div className="relative w-full h-full bg-abyss-black overflow-hidden select-none">
            {/* Background Layer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{
                    backgroundImage: bgImage
                        ? `url(${bgImage}), radial-gradient(circle at 20% 30%, #1a1a2e 0%, #050505 55%, #020202 100%)`
                        : "radial-gradient(circle at 20% 30%, #1a1a2e 0%, #050505 55%, #020202 100%)"
                }}
            >
                <div className="absolute inset-0 bg-black/20 animate-pulse-slow" />
            </motion.div>

            {/* Interactables Layer */}
            <div className="absolute inset-0">
                {sceneData.interactables.map((item) => {
                    // Standard visibility check
                    if (item.requiredFlag && !flags[item.requiredFlag]) return null;
                    if (item.forbiddenFlag && flags[item.forbiddenFlag]) return null;
                    if (item.forbiddenFlags?.some((flag) => flags[flag])) return null;
                    if (item.oneTime && flags[`used_${item.id}`]) return null;

                    // Reveal mechanics check: 
                    // If item requires reveal, check if strict 'revealed_ID' flag is set
                    if (item.requiresReveal && !flags[`revealed_${item.id}`]) return null;

                    // Hide mechanics check:
                    if (flags[`hidden_${item.id}`]) return null;

                    return (
                        <div
                            key={item.id}
                            className={[
                                "absolute cursor-help transition-colors duration-300 rounded-full",
                                isLowSanity ? "bg-blood-dark/30 hover:bg-blood-dark/50" : "bg-gray-800/20 hover:bg-gray-700/30"
                            ].join(" ")}
                            style={{
                                left: `${item.rect.x}%`,
                                top: `${item.rect.y}%`,
                                width: `${item.rect.width}%`,
                                height: `${item.rect.height}%`,
                            }}
                            onClick={() => handleInteract(item)}
                        />
                    );
                })}
            </div>

            {/* Navigation Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {sceneData.navigation.map((nav) => (
                    <div
                        key={nav.targetSceneId}
                        className={[
                            "group absolute pointer-events-auto cursor-pointer transition-colors duration-300 border border-transparent",
                            isLowSanity
                                ? "bg-blood-dark/25 hover:bg-blood-dark/40 hover:border-blood-dark/50"
                                : "bg-gray-800/15 hover:bg-blue-500/10 hover:border-blue-500/30"
                        ].join(" ")}
                        style={{
                            left: `${nav.position.x}%`,
                            top: `${nav.position.y}%`,
                            width: `${nav.position.width}%`,
                            height: `${nav.position.height}%`,
                        }}
                        onClick={() => handleNavigation(nav)}
                    >
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="font-serif tracking-[0.35em]">
                                {nav.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* UI Layer */}
            <DialogueBox
                text={activeDialogue}
                onDismiss={() => setActiveDialogue(null)}
            />
        </div>
    );
};
