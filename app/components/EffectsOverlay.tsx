'use client';

import { useGameState } from '@/app/hooks/useGameState';

export const EffectsOverlay = () => {
    const { sanity } = useGameState();

    // Calculate specific opacities based on sanity
    // Sanity 100 -> 0 opacity
    // Sanity 0 -> High opacity
    const grainOpacity = Math.max(0.05, (100 - sanity) / 100 * 0.4);
    const vignetteOpacity = Math.max(0.2, (100 - sanity) / 100 * 0.8);
    const saturation = Math.max(0, sanity / 100); // 1 to 0 (grayscale at 0)

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-overlay">
            {/* Film Grain */}
            <div
                className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[var(--grain-opacity)] animate-flicker"
                style={{ '--grain-opacity': grainOpacity } as React.CSSProperties}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-abyss-black opacity-[var(--vignette-opacity)]"
                style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(5,5,5,${vignetteOpacity}) 90%)`
                }}
            />

            {/* Color Grade / Saturation */}
            <div
                className="absolute inset-0 backdrop-grayscale-[var(--grayscale)] transition-all duration-1000"
                style={{ '--grayscale': 1 - saturation } as React.CSSProperties}
            />

            {/* Low Sanity Hallucinations Container (Optional) */}
            {sanity < 30 && (
                <div className="absolute inset-0 animate-pulse-slow bg-blood-dark/10 mix-blend-multiply" />
            )}
        </div>
    );
};
