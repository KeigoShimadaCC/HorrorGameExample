'use client';

import { useGameState } from '@/app/hooks/useGameState';

export const SanityMeter = () => {
    const { sanity } = useGameState();

    // Color interpolation logic could go here, or just classes
    let colorClass = 'bg-sanity-good';
    if (sanity < 60) colorClass = 'bg-sanity-med';
    if (sanity < 30) colorClass = 'bg-sanity-low';

    return (
        <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-1">
            <span className="text-xs font-serif text-faded tracking-widest uppercase">
                Sanity (正気度)
            </span>
            <div className="h-2 w-32 bg-abyss-dark border border-gray-800 rounded-sm overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${sanity}%` }}
                />
            </div>
        </div>
    );
};
