import { motion } from 'framer-motion';
import { GameCard as GameCardType } from '../types/game';

interface GameCardProps {
  card: GameCardType;
  onClick: () => void;
  showPreview: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onClick, showPreview }) => {
  const isRevealed = card.isFlipped || card.isMatched || showPreview;

  return (
    <motion.div
      className="relative w-full aspect-square cursor-pointer perspective-1000"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: card.isMatched ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d transition-transform duration-700"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
      >
        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 shadow-lg border border-white/20">
          <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-800/80 to-blue-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-2xl sm:text-3xl md:text-4xl text-white/80">🚀</div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-white/10">
          <div className="w-full h-full rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 text-white overflow-hidden">
            {card.type === 'image' ? (
              <div className="w-full h-full flex items-center justify-center">
                {card.image.startsWith('http') ? (
                  <img 
                    src={card.image} 
                    alt={card.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                    {card.image}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold mb-1 sm:mb-2 leading-tight break-words">
                  {card.name}
                </div>
                {card.englishName && (
                  <div className="text-xs sm:text-sm md:text-base text-white/70 break-words">
                    {card.englishName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameCard;