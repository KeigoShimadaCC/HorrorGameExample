'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAudio } from '@/app/hooks/useAudio';
import { ENDINGS } from '@/app/lib/endings';

interface TitleScreenProps {
    onStart: () => void;
}

export const TitleScreen = ({ onStart }: TitleScreenProps) => {
    const { isUnlocked, unlockAudio } = useAudio();
    const [showAchievements, setShowAchievements] = useState(false);
    const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem('the_house_endings');
            const parsed = raw ? JSON.parse(raw) : [];
            setUnlockedEndings(Array.isArray(parsed) ? parsed : []);
        } catch {
            setUnlockedEndings([]);
        }
    }, [showAchievements]);

    const totalEndings = ENDINGS.length;
    const unlockedCount = useMemo(() => {
        const unique = new Set(unlockedEndings);
        return ENDINGS.filter((ending) => unique.has(ending.id)).length;
    }, [unlockedEndings]);

    const handleStart = () => {
        onStart();
    };

    return (
        <div className="fixed inset-0 z-[150] bg-abyss-black text-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,26,46,0.6),rgba(5,5,5,1)_60%)]" />
            {!isUnlocked && (
                <button
                    onClick={unlockAudio}
                    className="fixed bottom-4 right-4 z-[160] px-4 py-2 bg-abyss-dark/80 border border-white/20 text-faded hover:text-white font-serif tracking-widest text-[10px] transition-colors"
                >
                    Enable Audio
                </button>
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center"
            >
                {showAchievements ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-2xl border border-white/20 bg-abyss-dark/80 backdrop-blur-md p-8 md:p-10 text-left"
                    >
                        <h2 className="text-2xl md:text-3xl font-serif tracking-[0.25em] text-red-500/80 uppercase">
                            Achievements
                        </h2>
                        <div className="mt-2 text-xs text-faded/70 tracking-widest uppercase font-serif">
                            {unlockedCount} of {totalEndings} endings found
                        </div>
                        <div className="mt-6 space-y-3 text-sm md:text-base text-faded font-serif">
                            {ENDINGS.map((ending) => {
                                const unlocked = unlockedEndings.includes(ending.id);
                                return (
                                    <div key={ending.id} className="flex gap-3 items-start">
                                        <span className={unlocked ? "text-red-400/70" : "text-faded/40"}>-</span>
                                        <span className={unlocked ? "" : "text-faded/40"}>
                                            {unlocked ? ending.name : "Locked"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowAchievements(false)}
                            className="mt-8 px-8 py-2 border border-white/30 text-xs tracking-[0.35em] uppercase hover:bg-white/10 transition-colors font-serif"
                        >
                            Back
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2 }}
                            className="text-5xl md:text-7xl font-serif tracking-[0.35em] text-red-500/80"
                        >
                            THE HOUSE
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.6 }}
                            className="mt-6 max-w-xl text-sm md:text-base text-faded font-serif leading-relaxed"
                        >
                            The rain has been falling for three days. You return to an empty house, and the walls remember your name.
                        </motion.p>
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.1 }}
                                onClick={handleStart}
                                className="px-10 py-3 border border-white/30 text-xs tracking-[0.35em] uppercase hover:bg-white/10 transition-colors font-serif"
                            >
                                {isUnlocked ? 'Enter' : 'Enter (Enable Audio)'}
                            </motion.button>
                            <button
                                onClick={() => setShowAchievements(true)}
                                className="px-8 py-2 border border-white/10 text-[10px] tracking-[0.35em] uppercase hover:bg-white/10 transition-colors text-faded font-serif"
                            >
                                View Achievements
                            </button>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 2, delay: 1.5 }}
                            className="mt-8 text-[10px] tracking-[0.4em] text-faded/70 uppercase"
                        >
                            Press the button to begin
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
};
