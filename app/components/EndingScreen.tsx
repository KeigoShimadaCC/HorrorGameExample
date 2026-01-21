'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ending } from '@/app/lib/endings';

interface EndingScreenProps {
    ending: Ending;
    onReset: () => void;
}

export const EndingScreen = ({ ending, onReset }: EndingScreenProps) => {
    const [showText, setShowText] = useState(false);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowText(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(true), 4500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const key = 'the_house_endings';
            const raw = window.localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : [];
            const ids = Array.isArray(parsed) ? parsed : [];
            if (!ids.includes(ending.id)) {
                ids.push(ending.id);
                window.localStorage.setItem(key, JSON.stringify(ids));
            }
        } catch {
            // Ignore localStorage failures.
        }
    }, [ending.id]);

    const getEndingText = (id: string) => {
        switch (id) {
            case 'onryo_grasp':
                return "You linger in the closet. The air turns cold. A vengeful spirit stands inches from your face. There is no time to scream.";
            case 'ritual_bargain':
                return "You complete the ritual. The house accepts the offering and loosens its grip. You are spared, but the debt remains.";
            case 'escape_true':
                return "You follow the map through the dunes and reach the sea shrine before dawn. The house fades behind you, quiet at last.";
            case 'cosmic_truth':
                return "You understand everything. The entity is not evil - it simply IS. Your grandmother made a pact to save the village from a tsunami in 1967. Every 60 years, someone must return to the sea. You walk into the ocean willingly. The cycle continues.";
            case 'consumed':
                return "Sanity hits 0. You become part of the house. You're looking at the entry hall from inside a photograph.";
            case 'escape_broken':
                return "Months later, you still hear dripping water. You still see her in mirrors. You still dream of rising tides. And sometimes, when it rains, you find yourself walking toward the sea.";
            case 'sealed_in':
                return "The salt line holds, but so do the walls. The house keeps what it has claimed, and the night never ends.";
            case 'escape_clean':
                return "You survive the night with sanity mostly intact. The house burns behind you. But the ocean remains. And in 60 years...";
            default:
                return "The night ends.";
        }
    };

    const getHintText = (id: string) => {
        switch (id) {
            case 'onryo_grasp':
                return "Hint: The closet does not like guests. Leave quickly, or seek the spirit's origin first.";
            case 'consumed':
                return "Hint: Some rooms hide items that protect your sanity. Search the bathroom cabinet and avoid the forbidden book.";
            case 'cosmic_truth':
                return "Hint: To uncover the truth, connect the diary, the study letter, and the strange book.";
            case 'escape_broken':
                return "Hint: You can escape, but knowledge changes you. Try leaving without reading the strange book.";
            case 'escape_clean':
                return "Hint: Hold onto your sanity and endure the night. Time advances as you explore.";
            case 'escape_true':
                return "Hint: Keys and a map are required before the car will get you out.";
            case 'sealed_in':
                return "Hint: The hallway can be sealed. Find salt and use the line in the hall.";
            case 'ritual_bargain':
                return "Hint: A talisman and a shrine are both needed. Look for a locked storage path.";
            default:
                return "Hint: Explore every room and revisit places after major discoveries.";
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-center p-10 select-none">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="text-4xl md:text-6xl font-serif mb-8 text-center text-red-500/80 tracking-widest"
            >
                {ending.name}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: showText ? 1 : 0 }}
                transition={{ duration: 3 }}
                className="max-w-2xl text-center text-gray-400 leading-relaxed font-serif text-lg mb-12"
            >
                {getEndingText(ending.id)}
            </motion.p>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: showText ? 1 : 0 }}
                transition={{ duration: 1, delay: 4 }}
                onClick={onReset}
                className="border border-white/20 px-8 py-3 hover:bg-white/10 transition-colors text-sm tracking-widest uppercase"
            >
                Play Again
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 10 }}
                transition={{ duration: 1 }}
                className="mt-8 max-w-xl text-center text-xs text-faded/80 font-serif border border-white/10 bg-abyss-dark/70 px-6 py-4"
            >
                {getHintText(ending.id)}
            </motion.div>
        </div>
    );
};
