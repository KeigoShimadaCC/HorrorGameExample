'use client';

import { useAudio } from '@/app/hooks/useAudio';

export const AudioControls = () => {
    const { isUnlocked, unlockAudio, isMuted, toggleMute, volume, setVolume } = useAudio();

    if (!isUnlocked) {
        return (
            <button
                onClick={unlockAudio}
                className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-abyss-dark/80 border border-gray-800 text-faded hover:text-white font-serif tracking-widest text-xs transition-colors"
            >
                Enable Audio
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-abyss-dark/80 border border-gray-800 px-3 py-2">
            <button
                onClick={toggleMute}
                className="text-faded hover:text-white font-serif tracking-widest text-xs transition-colors"
            >
                {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 accent-gray-400"
                aria-label="Volume"
            />
        </div>
    );
};
