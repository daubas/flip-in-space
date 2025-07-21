import { GameStats as GameStatsType } from '../types/game';
import { Clock, Target, Trophy } from 'lucide-react';

interface GameStatsProps {
  stats: GameStatsType;
  totalPairs: number;
}

const GameStats: React.FC<GameStatsProps> = ({ stats, totalPairs }) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 text-white/90 text-xs sm:text-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>{formatTime(stats.elapsedTime)}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Target className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{stats.steps} 步</span>
        <span className="sm:hidden">{stats.steps}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>{stats.matches}/{totalPairs}</span>
      </div>
    </div>
  );
};

export default GameStats;