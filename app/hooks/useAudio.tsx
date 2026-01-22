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
    isUnlocked: boolean;
    unlockAudio: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

// Manifest mapping logic keys to file paths
const AUDIO_MANIFEST: Record<string, { file: string; fallback: 'silence' | 'beep' | 'knock' | 'noise' }> = {
    // Ambient
    "entry_rain": { file: "/audio/ambient/rain_light.mp3", fallback: "noise" },
    "room_silence_breathing": { file: "/audio/ambient/room_breath.mp3", fallback: "silence" },
    "dripping_water": { file: "/audio/ambient/drip_loop.mp3", fallback: "noise" },
    "study_silence_clock": { file: "/audio/ambient/clock_tick.mp3", fallback: "noise" },
    "creaking_wood": { file: "/audio/ambient/creaking_wood.mp3", fallback: "noise" },
    "tv_static": { file: "/audio/ambient/tv_static.mp3", fallback: "noise" },
    "ambient_dread_8bit": { file: "/audio/ambient/ambient_dread_8bit.wav", fallback: "noise" },
    "ambient_distant_16bit": { file: "/audio/ambient/ambient_distant_16bit.wav", fallback: "noise" },
    "ambient_tension_8bit": { file: "/audio/ambient/ambient_tension_8bit.wav", fallback: "noise" },

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
    "step_squelch": { file: "/audio/sfx/step_squelch.mp3", fallback: "knock" },
    "stinger_hit": { file: "/audio/sfx/stinger_hit.wav", fallback: "beep" },
    "tension_rise": { file: "/audio/sfx/tension_rise.wav", fallback: "beep" },
    "glitch_burst": { file: "/audio/sfx/glitch_burst.wav", fallback: "beep" },
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [currentAmbient, setCurrentAmbient] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ambientFallbackRef = useRef<AudioBufferSourceNode | null>(null);
    const ambientFallbackGainRef = useRef<GainNode | null>(null);
    const ambientFallbackTypeRef = useRef<'beep' | 'knock' | 'silence' | 'noise'>('noise');
    const pendingAmbientRef = useRef<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ambientRef.current = new Audio();
            ambientRef.current.loop = true;
            ambientRef.current.addEventListener('error', () => {
                generateFallbackSound(ambientFallbackTypeRef.current);
            });
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
            stopAmbientFallback();
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (ambientRef.current) {
            ambientRef.current.volume = isMuted ? 0 : volume;
        }
        if (ambientFallbackGainRef.current) {
            ambientFallbackGainRef.current.gain.value = isMuted ? 0 : volume * 0.2;
        }
    }, [volume, isMuted]);

    const generateFallbackSound = (type: 'beep' | 'knock' | 'silence' | 'noise') => {
        if (!audioCtxRef.current || type === 'silence') return;

        const ctx = audioCtxRef.current;
        if (type === 'noise') {
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i += 1) {
                data[i] = Math.random() * 2 - 1;
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            const gain = ctx.createGain();
            gain.gain.value = isMuted ? 0 : volume * 0.2;
            source.connect(gain);
            gain.connect(ctx.destination);
            ambientFallbackRef.current?.stop();
            ambientFallbackRef.current = source;
            ambientFallbackGainRef.current = gain;
            source.start();
            return;
        }

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

    const stopAmbientFallback = () => {
        if (ambientFallbackRef.current) {
            ambientFallbackRef.current.stop();
            ambientFallbackRef.current.disconnect();
            ambientFallbackRef.current = null;
        }
        if (ambientFallbackGainRef.current) {
            ambientFallbackGainRef.current.disconnect();
            ambientFallbackGainRef.current = null;
        }
    };

    const unlockAudio = () => {
        if (isUnlocked) return;
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {
                // Ignore unlock failures; user can retry.
            });
        }
        setIsUnlocked(true);
        if (pendingAmbientRef.current) {
            const key = pendingAmbientRef.current;
            pendingAmbientRef.current = null;
            playAmbient(key);
        }
    };

    const playAmbient = (keyOrPath: string) => {
        if (!ambientRef.current) return;
        if (!isUnlocked) {
            pendingAmbientRef.current = keyOrPath;
            return;
        }

        // Determine actual path
        let path = keyOrPath;
        let fallbackType: 'silence' | 'beep' | 'knock' | 'noise' = 'noise';

        if (AUDIO_MANIFEST[keyOrPath]) {
            path = AUDIO_MANIFEST[keyOrPath].file;
            fallbackType = AUDIO_MANIFEST[keyOrPath].fallback;
        }

        // Don't restart if already playing
        if (currentAmbient === path && !ambientRef.current.paused) return;

        stopAmbientFallback();
        ambientFallbackTypeRef.current = fallbackType;
        ambientRef.current.src = path;
        ambientRef.current.play().catch(() => {
            // Fix: removed 'e'
            console.warn(`Ambient audio missing: ${path}. Playing fallback.`);
            generateFallbackSound(fallbackType);
        });
        setCurrentAmbient(path);
    };

    const stopAmbient = () => {
        if (ambientRef.current) {
            ambientRef.current.pause();
            setCurrentAmbient(null);
        }
        stopAmbientFallback();
    };

    const playSfx = (keyOrPath: string) => {
        if (!isUnlocked) {
            unlockAudio();
        }
        let path = keyOrPath;
        // Fix: Explicit type
        let fallbackType: 'beep' | 'knock' | 'silence' | 'noise' = 'beep'; // Default fallback

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
            toggleMute,
            isUnlocked,
            unlockAudio
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
