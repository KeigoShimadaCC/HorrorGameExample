'use client';

import { useGameState } from '@/app/hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getItem, ItemData } from '@/app/lib/items';
import { ItemInspector } from './ItemInspector';

export const Inventory = () => {
    const { inventory, setFlag } = useGameState();
    const [isOpen, setIsOpen] = useState(false);
    const [inspectItem, setInspectItem] = useState<ItemData | null>(null);

    const handleInspect = (itemId: string) => {
        const data = getItem(itemId);
        if (data) {
            setInspectItem(data);
            if (data.onInspectFlag) {
                setFlag(data.onInspectFlag, true);
            }
        }
    };

    return (
        <>
            <ItemInspector item={inspectItem} onClose={() => setInspectItem(null)} />

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 left-4 z-40 px-4 py-2 bg-abyss-dark/80 border border-gray-800 text-faded hover:text-white font-serif tracking-widest text-sm transition-colors"
            >
                {isOpen ? 'CLOSE' : 'ITEMS'}
            </button>

            {/* Inventory Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed top-0 left-0 h-full w-64 bg-abyss-black/95 border-r border-gray-800 z-30 p-8 pt-20 backdrop-blur-md"
                    >
                        <h2 className="text-xl font-serif text-gray-400 mb-6 border-b border-gray-800 pb-2">
                            Possessions
                        </h2>

                        {inventory.length === 0 ? (
                            <p className="text-sm text-gray-600 italic">Empty...</p>
                        ) : (
                            <ul className="space-y-4">
                                {inventory.map((itemId, idx) => (
                                    <li
                                        key={idx}
                                        className="text-sm text-gray-300 font-serif border-b border-gray-900 pb-2 cursor-pointer hover:text-white hover:border-gray-600 transition-colors"
                                        onClick={() => handleInspect(itemId)}
                                    >
                                        {getItem(itemId)?.name || itemId}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
