'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

type AudioContextType = {
    playAmbient: (key: string) => void;
    playSfx: (key: string) => void;
    stopAmbient: () => void;
    volume: number;
    setVolume: (vol: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

// Manifest mapping logic keys to file paths
const AUDIO_MANIFEST: Record<string, { file: string; fallback: 'silence' | 'beep' | 'knock' }> = {
    // Ambient
    "entry_rain": { file: "/audio/ambient/rain_light.mp3", fallback: "silence" },
    "room_silence_breathing": { file: "/audio/ambient/room_breath.mp3", fallback: "silence" },
    "dripping_water": { file: "/audio/ambient/drip_loop.mp3", fallback: "silence" },
    "study_silence_clock": { file: "/audio/ambient/clock_tick.mp3", fallback: "silence" },

    // SFX
    "tv_static_scream": { file: "/audio/sfx/tv_scream.mp3", fallback: "beep" },
    "footsteps_above": { file: "/audio/sfx/footsteps.mp3", fallback: "knock" },
    "breathing_close": { file: "/audio/sfx/breath.mp3", fallback: "silence" },
    "mirror_tap": { file: "/audio/sfx/tap.mp3", fallback: "knock" },
    "water_splash_scream": { file: "/audio/sfx/splash_scream.mp3", fallback: "beep" },
    "clock_333": { file: "/audio/sfx/clock_chime.mp3", fallback: "beep" },
    "child_laugh_distant": { file: "/audio/sfx/child_laugh.mp3", fallback: "silence" },
    "whisper_name": { file: "/audio/sfx/whisper.mp3", fallback: "silence" },
    "locked": { file: "/audio/sfx/locked.mp3", fallback: "knock" },
    "old_phone_ring": { file: "/audio/sfx/phone_ring.mp3", fallback: "beep" },
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [currentAmbient, setCurrentAmbient] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ambientRef.current = new Audio();
            ambientRef.current.loop = true;
            // Fix: Type safe window access
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContextClass();
        }
        return () => {
            if (ambientRef.current) {
                ambientRef.current.pause();
                ambientRef.current = null;
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (ambientRef.current) {
            ambientRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const generateFallbackSound = (type: 'beep' | 'knock' | 'silence') => {
        if (!audioCtxRef.current || type === 'silence') return;

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(isMuted ? 0 : 0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'knock') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            gain.gain.setValueAtTime(isMuted ? 0 : 0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    };

    const playAmbient = (keyOrPath: string) => {
        if (!ambientRef.current) return;

        // Determine actual path
        let path = keyOrPath;

        if (AUDIO_MANIFEST[keyOrPath]) {
            path = AUDIO_MANIFEST[keyOrPath].file;
        }

        // Don't restart if already playing
        if (currentAmbient === path && !ambientRef.current.paused) return;

        ambientRef.current.src = path;
        ambientRef.current.play().catch(() => {
            // Fix: removed 'e'
            console.warn(`Ambient audio missing: ${path}. Playing fallback.`);
            // Allow silence to be "played" conceptually so we don't retry endlessly
        });
        setCurrentAmbient(path);
    };

    const stopAmbient = () => {
        if (ambientRef.current) {
            ambientRef.current.pause();
            setCurrentAmbient(null);
        }
    };

    const playSfx = (keyOrPath: string) => {
        let path = keyOrPath;
        // Fix: Explicit type
        let fallbackType: 'beep' | 'knock' | 'silence' = 'beep'; // Default fallback

        if (AUDIO_MANIFEST[keyOrPath]) {
            path = AUDIO_MANIFEST[keyOrPath].file;
            fallbackType = AUDIO_MANIFEST[keyOrPath].fallback;
        }

        const sfx = new Audio(path);
        sfx.volume = isMuted ? 0 : volume;
        sfx.play().catch(() => {
            console.warn(`SFX missing: ${path}. Generating ${fallbackType}.`);
            generateFallbackSound(fallbackType);
        });
    };

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <AudioContext.Provider value={{
            playAmbient,
            playSfx,
            stopAmbient,
            volume,
            setVolume,
            isMuted,
            toggleMute
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
