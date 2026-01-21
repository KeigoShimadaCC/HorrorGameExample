'use client';

import { useState, useEffect } from 'react';
import { useGameState } from '@/app/hooks/useGameState';

export const DebugPanel = () => {
    const { sanity, flags, currentSceneId, inventory, setSanity, setFlag, setScene, events } = useGameState();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '`') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 z-[9999] bg-black/90 text-green-400 p-4 font-mono text-xs w-96 max-h-screen overflow-y-auto border-r border-green-800 opacity-90">
            <h3 className="text-lg font-bold mb-4 border-b border-green-800 pb-2">DEBUG CONSOLE</h3>

            <div className="mb-4">
                <h4 className="font-bold text-white mb-2">STATUS</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>Scene: <span className="text-white">{currentSceneId}</span></div>
                    <div>Sanity: <span className="text-white">{sanity}</span></div>
                    <input
                        type="range"
                        min="0" max="100"
                        value={sanity}
                        onChange={(e) => setSanity(parseInt(e.target.value))}
                        className="col-span-2 w-full accent-green-500"
                    />
                </div>
            </div>

            <div className="mb-4">
                <h4 className="font-bold text-white mb-2">FLAGS</h4>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {Object.entries(flags).map(([key, val]) => (
                        <div key={key} className="flex justify-between hover:bg-white/10 p-1 rounded">
                            <span>{key}</span>
                            <span
                                className={`cursor-pointer ${val ? 'text-green-300' : 'text-red-400'}`}
                                onClick={() => setFlag(key, !val)}
                            >
                                {val.toString()}
                            </span>
                        </div>
                    ))}
                    {Object.keys(flags).length === 0 && <span className="text-gray-500 italic">No flags set</span>}
                </div>
                <div className="mt-2 flex gap-2">
                    <button onClick={() => setFlag('read_diary', true)} className="border border-green-700 px-2 active:bg-green-900">Add: read_diary</button>
                    <button onClick={() => setFlag('learned_covenant', true)} className="border border-green-700 px-2 active:bg-green-900">Add: learned_covenant</button>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="font-bold text-white mb-2">EVENTS TRIGGERED</h4>
                <div className="text-gray-400">
                    {events?.join(', ') || "None"}
                </div>
            </div>

            <div className="mb-4">
                <h4 className="font-bold text-white mb-2">NAVIGATION</h4>
                <div className="flex flex-wrap gap-2">
                    {['entry_hall', 'hallway', 'kitchen', 'living_room', 'grandmothers_room', 'bathroom', 'study', 'utility_room', 'storage_closet', 'outside_porch', 'hidden_shrine'].map(id => (
                        <button
                            key={id}
                            onClick={() => setScene(id)}
                            className="border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800"
                        >
                            {id}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-white mb-2">INVENTORY</h4>
                <div>{inventory.join(', ')}</div>
            </div>
        </div>
    );
};
