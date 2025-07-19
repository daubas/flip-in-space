import { useState, useCallback } from 'react';
import { GameState, GameCard, CardData } from '../types/game';
import { useGameTimer } from './useGameTimer';

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createGameCards = (cardData: CardData[]): GameCard[] => {
  const cards: GameCard[] = [];
  
  cardData.forEach((data, index) => {
    cards.push({
      ...data,
      type: 'name',
      isFlipped: false,
      isMatched: false,
      position: index * 2,
    });
    
    cards.push({
      ...data,
      type: 'image',
      isFlipped: false,
      isMatched: false,
      position: index * 2 + 1,
    });
  });

  // Shuffle cards
  return shuffleArray(cards);
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    gameStats: {
      steps: 0,
      matches: 0,
      startTime: null,
      endTime: null,
      elapsedTime: 0,
    },
    isGameStarted: false,
    isGameCompleted: false,
    showPreview: false,
    previewCountdown: 0,
  });

  const { elapsedTime, reset: resetTimer } = useGameTimer(
    gameState.isGameStarted,
    gameState.isGameCompleted
  );

  const initializeGame = useCallback((cardData: CardData[]) => {
    const cards = createGameCards(cardData);
    const previewDuration = Math.min(Math.max(cardData.length * 0.5, 3), 8);
    
    setGameState({
      cards,
      flippedCards: [],
      gameStats: {
        steps: 0,
        matches: 0,
        startTime: null,
        endTime: null,
        elapsedTime: 0,
      },
      isGameStarted: false,
      isGameCompleted: false,
      showPreview: true,
      previewCountdown: previewDuration,
    });

    // Show preview countdown
    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.previewCountdown <= 1) {
          clearInterval(countdownInterval);
          return {
            ...prev,
            showPreview: false,
            previewCountdown: 0,
            isGameStarted: true,
            gameStats: {
              ...prev.gameStats,
              startTime: Date.now(),
            },
          };
        }
        return {
          ...prev,
          previewCountdown: prev.previewCountdown - 1,
        };
      });
    }, 1000);
  }, []);

  const flipCard = useCallback((cardIndex: number) => {
    setGameState(prev => {
      if (!prev.isGameStarted || prev.isGameCompleted || prev.flippedCards.length >= 2) {
        return prev;
      }

      const card = prev.cards[cardIndex];
      if (card.isFlipped || card.isMatched) return prev;

      const newCards = [...prev.cards];
      newCards[cardIndex] = { ...card, isFlipped: true };
      
      const newFlippedCards = [...prev.flippedCards, newCards[cardIndex]];
      let newStats = { ...prev.gameStats };

      // Check for match when two cards are flipped
      if (newFlippedCards.length === 2) {
        newStats.steps += 1;
        
        const [first, second] = newFlippedCards;
        const isMatch = first.id === second.id && first.type !== second.type;

        if (isMatch) {
          newStats.matches += 1;
          
          // Mark matched cards
          newCards.forEach((card, index) => {
            if (card.id === first.id) {
              newCards[index] = { ...card, isMatched: true };
            }
          });

          // Check if game is completed
          const isGameCompleted = newCards.every(card => card.isMatched);
          
          return {
            ...prev,
            cards: newCards,
            flippedCards: [],
            gameStats: {
              ...newStats,
              elapsedTime,
              endTime: isGameCompleted ? Date.now() : null,
            },
            isGameCompleted,
          };
        } else {
          // Not a match - flip cards back after delay
          setTimeout(() => {
            setGameState(current => ({
              ...current,
              cards: current.cards.map(card => 
                card.id === first.id || card.id === second.id
                  ? { ...card, isFlipped: false }
                  : card
              ),
              flippedCards: [],
            }));
          }, 1000);
        }
      }

      return {
        ...prev,
        cards: newCards,
        flippedCards: newFlippedCards,
        gameStats: newStats,
      };
    });
  }, [elapsedTime]);

  const resetGame = useCallback(() => {
    setGameState(prev => {
      // 重新打亂卡片順序
      const originalCardData = prev.cards.reduce((acc: CardData[], card) => {
        const existing = acc.find(c => c.id === card.id);
        if (!existing) {
          acc.push({
            id: card.id,
            name: card.name,
            image: card.image,
            englishName: card.englishName,
          });
        }
        return acc;
      }, []);

      const newCards = createGameCards(originalCardData);
      const previewDuration = Math.min(Math.max(originalCardData.length * 0.5, 3), 8);

      // 重置計時器
      resetTimer();

      const newState = {
        ...prev,
        cards: newCards,
        flippedCards: [],
        gameStats: {
          steps: 0,
          matches: 0,
          startTime: null,
          endTime: null,
          elapsedTime: 0,
        },
        isGameStarted: false,
        isGameCompleted: false,
        showPreview: true,
        previewCountdown: previewDuration,
      };

      // 開始新的倒數
      setTimeout(() => {
        const countdownInterval = setInterval(() => {
          setGameState(current => {
            if (current.previewCountdown <= 1) {
              clearInterval(countdownInterval);
              return {
                ...current,
                showPreview: false,
                previewCountdown: 0,
                isGameStarted: true,
                gameStats: {
                  ...current.gameStats,
                  startTime: Date.now(),
                },
              };
            }
            return {
              ...current,
              previewCountdown: current.previewCountdown - 1,
            };
          });
        }, 1000);
      }, 100); // 短暫延遲確保狀態更新完成

      return newState;
    });
  }, [resetTimer]);

  return {
    gameState: {
      ...gameState,
      gameStats: {
        ...gameState.gameStats,
        elapsedTime: gameState.isGameStarted ? elapsedTime : 0,
      },
    },
    initializeGame,
    flipCard,
    resetGame,
  };
};