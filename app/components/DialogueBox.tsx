'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/app/hooks/useGameState';

interface DialogueBoxProps {
    text: string | null;
    onDismiss: () => void;
}

export const DialogueBox = ({ text, onDismiss }: DialogueBoxProps) => {
    const { sanity } = useGameState();
    const isLowSanity = sanity < 40;

    return (
        <AnimatePresence>
            {text && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={onDismiss}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={[
                            "fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl border p-6 backdrop-blur-sm cursor-pointer shadow-2xl transition-colors duration-500",
                            isLowSanity
                                ? "bg-abyss-black/95 border-blood-dark/50 text-red-100/90"
                                : "bg-abyss-dark/90 border-gray-800 text-gray-200"
                        ].join(" ")}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <p className={`text-lg leading-relaxed ${isLowSanity ? "font-serif tracking-wide" : "font-serif"}`}>
                            {text}
                        </p>
                        <div className="mt-4 flex justify-end">
                            <span className={`text-xs animate-pulse ${isLowSanity ? "text-red-200/70 tracking-widest" : "text-faded"}`}>
                                Click outside to continue
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
