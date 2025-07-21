export interface CardData {
  id: string;
  name: string;
  image: string;
  englishName?: string;
}

export interface GameCard extends CardData {
  type: 'name' | 'image';
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

export interface GameStats {
  steps: number;
  matches: number;
  startTime: number | null;
  endTime: number | null;
  elapsedTime: number;
}

export interface GameState {
  cards: GameCard[];
  flippedCards: GameCard[];
  gameStats: GameStats;
  isGameStarted: boolean;
  isGameCompleted: boolean;
  showPreview: boolean;
  previewCountdown: number;
}