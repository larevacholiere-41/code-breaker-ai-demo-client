import axios from "axios";
import type { GameState } from "../types/gameApi";

export const createVsAiGameMutationFn = async (
  secret_1: string
): Promise<GameState> => {
  const url = `${import.meta.env.VITE_API_URL}/start-new-game-player-vs-ai`;
  const response = await axios.post(url, {}, { params: { secret_1 } });
  return response.data;
};

export const createAiVsAiGameMutationFn = async (
  secret: string
): Promise<GameState> => {
  const url = `${import.meta.env.VITE_API_URL}/start-new-game-ai-vs-ai`;
  const response = await axios.post(url, {}, { params: { secret } });
  return response.data;
};

export const makeGuessMutationFn = async (
  gameId: string,
  guess: string
): Promise<GameState> => {
  const url = `${import.meta.env.VITE_API_URL}/make-guess`;
  const response = await axios.post(
    url,
    {},
    { params: { game_id: gameId, guess } }
  );
  return response.data;
};
