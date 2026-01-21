import { create } from 'zustand';
import { GameState } from '@/app/types';

interface GameStore extends GameState {
    setSanity: (value: number) => void;
    decreaseSanity: (amount: number) => void;
    setScene: (sceneId: string) => void;
    addItem: (item: string) => void;
    setFlag: (flag: string, value: boolean) => void;
    triggerEvent: (eventId: string) => void;
    advanceTime: (amount: number) => void;
    resetGame: () => void;
}

const INITIAL_STATE: GameState = {
    sanity: 100,
    currentSceneId: 'entry_hall',
    inventory: [],
    flags: {},
    events: [], // New: Track triggered events
    time: 0,
};

export const useGameState = create<GameStore>((set) => ({
    ...INITIAL_STATE,

    setSanity: (val) => set({ sanity: Math.max(0, Math.min(100, val)) }),

    decreaseSanity: (amount) => set((state) => ({
        sanity: Math.max(0, state.sanity - amount)
    })),

    setScene: (sceneId) => set({ currentSceneId: sceneId }),

    addItem: (item) => set((state) => ({
        inventory: [...state.inventory, item]
    })),

    setFlag: (flag, value) => set((state) => ({
        flags: { ...state.flags, [flag]: value }
    })),

    triggerEvent: (eventId) => set((state) => ({
        events: [...(state.events || []), eventId]
    })),

    advanceTime: (amount) => set((state) => ({
        time: Math.min(100, state.time + amount)
    })),

    resetGame: () => set(INITIAL_STATE),
}));
