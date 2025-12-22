export type GameStatusType = "in_progress" | "completed" | "cancelled";
export type PlayerType = "player_1" | "player_2";

export interface Guess {
  code: string;
  feedback: string;
  comments: string | null;
  player: PlayerType;
}

export interface GameState {
  game_id: string;
  player_1_secret_code: string;
  player_2_secret_code: string;
  history: Guess[];
  status: GameStatusType;
  waiting_for_player: PlayerType;
  winner: PlayerType | null;
}
