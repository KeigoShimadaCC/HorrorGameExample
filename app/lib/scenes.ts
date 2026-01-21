import entryHall from '@/data/scenes/entry_hall.json';
import hallway from '@/data/scenes/hallway.json';
import kitchen from '@/data/scenes/kitchen.json';
import livingRoom from '@/data/scenes/living_room.json';
import grandmothersRoom from '@/data/scenes/grandmothers_room.json';
import study from '@/data/scenes/study.json';
import bathroom from '@/data/scenes/bathroom.json';
import { SceneData } from '@/app/types';

const scenes: Record<string, SceneData> = {
    entry_hall: entryHall as unknown as SceneData,
    hallway: hallway as unknown as SceneData,
    kitchen: kitchen as unknown as SceneData,
    living_room: livingRoom as unknown as SceneData,
    grandmothers_room: grandmothersRoom as unknown as SceneData,
    study: study as unknown as SceneData,
    bathroom: bathroom as unknown as SceneData,
};

export const getScene = (id: string): SceneData | null => {
    return scenes[id] || null;
};
