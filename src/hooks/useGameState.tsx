import { useEffect, useState } from "react";
import type { GameState } from "../types/gameApi";

export const useGameState = (gameId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/get-game-updates?game_id=${gameId}`
    );

    eventSource.onmessage = (event) => {
      console.log("Event:", event);
      const data = JSON.parse(event.data);
      setGameState(data);
      if (data.status === "completed") {
        eventSource.close();
      }
    };

    eventSource.onerror = (_) => {
      console.error("Error fetching game state");
    };

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [gameId]);

  return { gameState, error };
};
