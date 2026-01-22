'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ItemData } from '@/app/lib/items';
import { useGameState } from '@/app/hooks/useGameState';

interface ItemInspectorProps {
    item: ItemData | null;
    onClose: () => void;
}

export const ItemInspector = ({ item, onClose }: ItemInspectorProps) => {
    const { sanity } = useGameState();
    const isLowSanity = sanity < 40;

    return (
        <AnimatePresence>
            {item && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className={[
                            "relative max-w-lg w-full border p-8 shadow-2xl transition-colors duration-500",
                            isLowSanity
                                ? "bg-abyss-black/95 border-blood-dark/50 text-red-100/90"
                                : "bg-[#1a1a1a] border-gray-700 text-gray-200"
                        ].join(" ")}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className={`text-2xl font-serif mb-2 ${isLowSanity ? "tracking-wide" : ""}`}>
                            {item.name}
                        </h2>
                        <div className={`h-px w-full mb-4 ${isLowSanity ? "bg-blood-dark/60" : "bg-gray-700"}`} />

                        {item.image && (
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-20 w-20 object-contain opacity-90"
                                />
                            </div>
                        )}

                        <p className={`italic mb-6 ${isLowSanity ? "text-red-200/70" : "text-gray-400"}`}>
                            {item.description}
                        </p>

                        {item.content && (
                            <div className={[
                                "p-6 font-serif leading-relaxed text-sm shadow-inner transform rotate-1",
                                isLowSanity ? "bg-[#1b1212] text-red-100/90 border border-blood-dark/40" : "bg-[#f0e6d2] text-black"
                            ].join(" ")}>
                                {item.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 min-h-[1em]">{line}</p>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className={[
                                "mt-8 px-6 py-2 border transition-colors uppercase text-xs tracking-widest w-full",
                                isLowSanity
                                    ? "border-blood-dark/60 text-red-200/70 hover:text-red-100 hover:border-blood-dark"
                                    : "border-gray-600 text-gray-400 hover:text-white hover:border-white"
                            ].join(" ")}
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
