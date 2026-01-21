'use client';

import { useGameState } from '@/app/hooks/useGameState';

export const EffectsOverlay = () => {
    const { sanity } = useGameState();
    const noiseDataUrl = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

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
                className="absolute inset-0 opacity-[var(--grain-opacity)] animate-flicker"
                style={{ backgroundImage: `url("${noiseDataUrl}")`, '--grain-opacity': grainOpacity } as React.CSSProperties}
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
