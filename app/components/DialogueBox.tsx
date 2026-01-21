'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DialogueBoxProps {
    text: string | null;
    onDismiss: () => void;
}

export const DialogueBox = ({ text, onDismiss }: DialogueBoxProps) => {
    return (
        <AnimatePresence>
            {text && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-abyss-dark/90 border border-gray-800 p-6 z-40 backdrop-blur-sm cursor-pointer shadow-2xl"
                    onClick={onDismiss}
                >
                    <p className="font-serif text-lg leading-relaxed text-gray-200">
                        {text}
                    </p>
                    <div className="mt-4 flex justify-end">
                        <span className="text-xs text-faded animate-pulse">Click to continue ▼</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
