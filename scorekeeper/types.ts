export interface ScorePayload {
  score: number;
}

export interface ScoreResponse {
  success: boolean;
  currentScore: number;
  highScore: number;
  message?: string;
}

export interface ScoreState {
  current: number;
  high: number;
}