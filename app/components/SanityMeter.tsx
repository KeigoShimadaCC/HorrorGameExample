'use client';

import { useGameState } from '@/app/hooks/useGameState';

export const SanityMeter = () => {
    const { sanity } = useGameState();

    let barColor = '#4f7d4f';
    if (sanity < 60) barColor = '#a88b2d';
    if (sanity < 30) barColor = '#8a0000';

    return (
        <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-1">
            <span className="text-xs font-serif text-faded tracking-widest uppercase">
                Sanity
            </span>
            <div className="h-2 w-32 bg-abyss-dark border border-gray-800 rounded-sm overflow-hidden">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${sanity}%`, backgroundColor: barColor }}
                />
            </div>
        </div>
    );
};
