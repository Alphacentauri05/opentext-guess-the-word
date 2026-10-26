export type UserRole = "PLAYER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  username: string;
  user_id: string;
}

export type LetterColor = "GREEN" | "ORANGE" | "GREY";

export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export interface GuessItem {
  guess_number: number;
  guess_word: string;
  feedback: LetterColor[];
  created_at: string;
}

export interface GameDetail {
  id: string;
  status: GameStatus;
  attempts_used: number;
  max_attempts: number;
  game_date: string;
  started_at: string;
  completed_at: string | null;
  guesses: GuessItem[];
  daily_games_played: number;
  daily_games_remaining: number;
  secret_word?: string | null;
  message?: string | null;
}

export interface DailyQuotaStatus {
  date: string;
  daily_limit: number;
  daily_games_played: number;
  daily_games_remaining: number;
  can_play: boolean;
  active_game_id: string | null;
}

export interface GameHistoryItem {
  id: string;
  game_date: string;
  word_attempted: string;
  attempts_used: number;
  max_attempts: number;
  status: GameStatus;
  is_won: boolean;
  correct_guesses: number;
  started_at: string;
  completed_at: string | null;
}

export interface DailyActivityReportItem {
  date: string;
  number_of_users: number;
  number_of_correct_guesses: number;
  total_games_played: number;
}

export interface UserActivityReportItem {
  user_id: string;
  username: string;
  date: string;
  words_tried: number;
  number_of_correct_guesses: number;
}

export interface AdminSummaryStats {
  total_players: number;
  total_games_played: number;
  total_games_won: number;
  overall_win_rate: number;
}
