'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ItemData } from '@/app/lib/items';

interface ItemInspectorProps {
    item: ItemData | null;
    onClose: () => void;
}

export const ItemInspector = ({ item, onClose }: ItemInspectorProps) => {
    return (
        <AnimatePresence>
            {item && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative max-w-lg w-full bg-[#1a1a1a] border border-gray-700 p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-serif text-gray-200 mb-2">{item.name}</h2>
                        <div className="h-px w-full bg-gray-700 mb-4" />

                        <p className="text-gray-400 italic mb-6">{item.description}</p>

                        {item.content && (
                            <div className="bg-[#f0e6d2] text-black p-6 font-serif leading-relaxed text-sm shadow-inner transform rotate-1">
                                {item.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 min-h-[1em]">{line}</p>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="mt-8 px-6 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors uppercase text-xs tracking-widest w-full"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
