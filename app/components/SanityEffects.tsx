'use client';

import { useEffect, useState } from 'react';
import { useGameState } from '@/app/hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';

interface SanityEffectsProps {
    children: React.ReactNode;
}

export const SanityEffects = ({ children }: SanityEffectsProps) => {
    const { sanity } = useGameState();
    const [flicker, setFlicker] = useState(false);

    // Random flicker effect for low sanity
    useEffect(() => {
        if (sanity >= 40) return;

        const triggerFlicker = () => {
            const shouldFlicker = Math.random() > 0.7; // 30% chance per interval
            if (shouldFlicker) {
                setFlicker(true);
                setTimeout(() => setFlicker(false), 50 + Math.random() * 100); // 50-150ms duration
            }

            // Schedule next check
            const nextDelay = 1000 + Math.random() * 5000; // 1-6 seconds
            timeoutId = setTimeout(triggerFlicker, nextDelay);
        };

        let timeoutId = setTimeout(triggerFlicker, 2000);
        return () => clearTimeout(timeoutId);
    }, [sanity]);

    // Calculate filter values based on sanity
    const getFilters = () => {
        if (sanity > 70) return 'none';

        const intensity = (70 - sanity) / 70; // 0 to 1 scaling inversely

        const grayscale = sanity < 70 ? Math.min(100, Math.floor(intensity * 100)) : 0;
        const contrast = sanity < 50 ? 100 + (intensity * 50) : 100; // Up to 150%
        const hue = sanity < 30 ? Math.floor(intensity * 30) : 0;
        const blur = sanity < 20 ? 1 : 0;

        return `grayscale(${grayscale}%) contrast(${contrast}%) hue-rotate(${hue}deg) blur(${blur}px)`;
    };

    const getGrainOpacity = () => {
        if (sanity > 70) return 0;
        if (sanity > 50) return 0.05;
        if (sanity > 30) return 0.15;
        return 0.3;
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Main Content with Filters */}
            <div
                className="w-full h-full transition-all duration-1000 ease-in-out"
                style={{ filter: getFilters() }}
            >
                {children}
            </div>

            {/* Grain Overlay */}
            {sanity <= 70 && (
                <div
                    className="pointer-events-none fixed inset-0 z-[100] mix-blend-overlay opacity-0"
                    style={{
                        opacity: getGrainOpacity(),
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            )}

            {/* Vignette (Low Sanity) */}
            {sanity <= 50 && (
                <div
                    className="pointer-events-none fixed inset-0 z-[101] transition-opacity duration-1000"
                    style={{
                        opacity: (50 - sanity) / 50,
                        background: 'radial-gradient(circle, transparent 50%, black 150%)'
                    }}
                />
            )}

            {/* Flicker (Very Low Sanity) */}
            <AnimatePresence>
                {flicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.05 }}
                        className="pointer-events-none fixed inset-0 z-[102] bg-black"
                    />
                )}
            </AnimatePresence>

            {/* Red Pulsing (Critical) */}
            {sanity <= 10 && (
                <div className="pointer-events-none fixed inset-0 z-[99] bg-red-900/10 animate-pulse" />
            )}
        </div>
    );
};
