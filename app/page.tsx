'use client';

import { GameCanvas } from "./components/GameCanvas";
import { SanityMeter } from "./components/SanityMeter";
import { EffectsOverlay } from "./components/EffectsOverlay";
import { Inventory } from "./components/Inventory";
import { SanityEffects } from "./components/SanityEffects";
import { DebugPanel } from "./components/DebugPanel";
import { EndingScreen } from "./components/EndingScreen";
import { checkEndingConditions } from "./lib/endings";
import { useGameState } from "./hooks/useGameState";
import { useEffect, useState } from "react";
import { Ending } from "./lib/endings";
import { AudioControls } from "./components/AudioControls";
import { TitleScreen } from "./components/TitleScreen";

export default function Home() {
  const gameState = useGameState();
  const [activeEnding, setActiveEnding] = useState<Ending | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Check ending conditions on state change
  useEffect(() => {
    const ending = checkEndingConditions(gameState);
    if (ending && !activeEnding) {
      setActiveEnding(ending);
    }
  }, [gameState, activeEnding]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-abyss-black text-foreground">
      {!hasStarted ? (
        <TitleScreen onStart={() => setHasStarted(true)} />
      ) : activeEnding ? (
        <EndingScreen
          ending={activeEnding}
          onReset={() => {
            gameState.resetGame();
            setActiveEnding(null);
            setHasStarted(false);
          }}
        />
      ) : (
        <>
          <DebugPanel />
          <EffectsOverlay />

          <SanityEffects>
            <GameCanvas />
          </SanityEffects>

          <SanityMeter />
          <Inventory />
          <AudioControls />
        </>
      )}

      <div className="fixed bottom-2 right-2 text-faded opacity-20 text-[10px] pointer-events-none font-serif">
        深淵の家
      </div>
    </main>
  );
}
