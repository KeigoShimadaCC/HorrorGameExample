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

    // Keep filter effects minimal; grain/vignette handled by EffectsOverlay
    const getFilters = () => {
        if (sanity > 70) return 'none';
        const intensity = (70 - sanity) / 70;
        const grayscale = Math.min(100, Math.floor(intensity * 100));
        const contrast = sanity < 50 ? 100 + (intensity * 30) : 100;
        const blur = sanity < 15 ? 1 : 0;
        return `grayscale(${grayscale}%) contrast(${contrast}%) blur(${blur}px)`;
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
