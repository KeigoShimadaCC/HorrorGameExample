'use client';

import { motion } from 'framer-motion';
import { useAudio } from '@/app/hooks/useAudio';

interface TitleScreenProps {
    onStart: () => void;
}

export const TitleScreen = ({ onStart }: TitleScreenProps) => {
    const { isUnlocked, unlockAudio } = useAudio();

    const handleStart = () => {
        if (!isUnlocked) {
            unlockAudio();
        }
        onStart();
    };

    return (
        <div className="fixed inset-0 z-[150] bg-abyss-black text-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,26,46,0.6),rgba(5,5,5,1)_60%)]" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center"
            >
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
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.1 }}
                    onClick={handleStart}
                    className="mt-10 px-10 py-3 border border-white/30 text-xs tracking-[0.35em] uppercase hover:bg-white/10 transition-colors font-serif"
                >
                    {isUnlocked ? 'Enter' : 'Enter (Enable Audio)'}
                </motion.button>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 2, delay: 1.5 }}
                    className="mt-10 text-[10px] tracking-[0.4em] text-faded/70 uppercase"
                >
                    Press the button to begin
                </motion.div>
            </motion.div>
        </div>
    );
};
