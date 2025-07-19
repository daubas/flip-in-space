import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './GameCard';
import GameStats from './GameStats';
import { GameState } from '../types/game';
import { RotateCcw, Home } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  onCardClick: (index: number) => void;
  onReset: () => void;
  onHome: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCardClick, onReset, onHome }) => {
  const totalPairs = gameState.cards.length / 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 relative z-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={onHome}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm sm:text-base"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">返回首頁</span>
            <span className="sm:hidden">首頁</span>
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center flex-1 px-2">
            🚀 太空記憶翻牌遊戲
          </h1>

          <button
            onClick={onReset}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm sm:text-base"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">重新開始</span>
            <span className="sm:hidden">重置</span>
          </button>
        </div>

        <GameStats stats={gameState.gameStats} totalPairs={totalPairs} />
      </div>

      {/* Preview Countdown */}
      <AnimatePresence>
        {gameState.showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center px-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                {gameState.previewCountdown}
              </div>
              <div className="text-lg sm:text-xl text-white/80">
                記住卡片位置！遊戲即將開始...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Grid */}
      <div className="w-full max-w-6xl flex-1 flex items-center justify-center">
        <div 
          className="grid gap-2 sm:gap-3 md:gap-4 justify-center w-full"
          style={{
            gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(gameState.cards.length * 1.5)), window.innerWidth < 640 ? 4 : 8)}, minmax(60px, 1fr))`,
            maxWidth: window.innerWidth < 640 ? '100%' : '90%',
          }}
        >
          {gameState.cards.map((card, index) => (
            <GameCard
              key={`${card.id}-${card.type}`}
              card={card}
              onClick={() => onCardClick(index)}
              showPreview={gameState.showPreview}
            />
          ))}
        </div>
      </div>

      {/* Victory Modal */}
      <AnimatePresence>
        {gameState.isGameCompleted && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-white/20 max-w-md w-full mx-4"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
            >
              <div className="text-4xl sm:text-6xl mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">恭喜完成！</h2>
              <div className="space-y-2 text-white/90 mb-6 text-sm sm:text-base">
                <p>完成時間: {Math.floor(gameState.gameStats.elapsedTime / 1000)} 秒</p>
                <p>總步數: {gameState.gameStats.steps} 步</p>
                <p>配對數: {gameState.gameStats.matches}/{totalPairs}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={onReset}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all text-sm sm:text-base"
                >
                  再玩一次
                </button>
                <button
                  onClick={onHome}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all text-sm sm:text-base"
                >
                  返回首頁
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;