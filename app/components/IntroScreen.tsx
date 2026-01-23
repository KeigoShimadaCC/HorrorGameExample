'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IntroScreenProps {
    onFinish: () => void;
}

const INTRO_LINES = [
    "The rain has been falling for three days. The wipers barely keep up.",
    "Headlights carve a narrow path through the coastal mist. The house appears as a smudge on the cliff, dark and patient.",
    "You left years ago and told yourself you'd never return. Then the calls stopped. Then the storms began.",
    "Grandmother's letters used to arrive on time. The last one came late, edges damp, ink feathered.",
    "A note lies on the passenger seat: \"If you go inside, do not answer the phone.\" The handwriting is hers.",
    "The engine idles. The dashboard ticks in small red pulses. Somewhere in the house, a light flickers.",
    "You breathe against the glass and watch it fog, then clear. Something moves in the mirror behind you.",
    "You kill the engine. The house waits."
];

export const IntroScreen = ({ onFinish }: IntroScreenProps) => {
    const [index, setIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        setShowHint(false);
        const timer = setTimeout(() => setShowHint(true), 20000);
        return () => clearTimeout(timer);
    }, [index]);

    const handleAdvance = () => {
        if (index < INTRO_LINES.length - 1) {
            setIndex(index + 1);
        } else {
            onFinish();
        }
    };

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleAdvance();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [index]);

    return (
        <div className="fixed inset-0 z-[140] bg-black">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url(/images/scenes/inside_car.png)",
                }}
            />
            <div className="absolute inset-0 bg-black/40" />

            <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-end justify-center p-8"
                onClick={handleAdvance}
            >
                <div className="w-full max-w-3xl bg-black/70 border border-white/20 p-6 text-center font-serif text-base md:text-lg text-gray-200 cursor-pointer">
                    <p className="leading-relaxed">{INTRO_LINES[index]}</p>
                    {showHint && (
                        <div className="mt-4 text-[10px] tracking-[0.35em] text-faded/70 uppercase">
                            Click to continue
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
