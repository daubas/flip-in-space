import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardData } from '../types/game';
import { Plus, Trash2, Download, Upload, Play, ArrowLeft, Share2 } from 'lucide-react';
import { generateGameUrl } from '../utils/urlGenerator';
import toast from 'react-hot-toast';

interface ContentManagerProps {
  cardData: CardData[];
  onCardDataChange: (data: CardData[]) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const ContentManager: React.FC<ContentManagerProps> = ({ 
  cardData, 
  onCardDataChange, 
  onStartGame,
  onBack
}) => {
  const [newCard, setNewCard] = useState({
    name: '',
    image: '',
    englishName: '',
  });

  const addCard = () => {
    if (!newCard.name.trim() || !newCard.image.trim()) {
      toast.error('請填寫名稱和圖片');
      return;
    }

    const card: CardData = {
      id: Date.now().toString(),
      name: newCard.name.trim(),
      image: newCard.image.trim(),
      englishName: newCard.englishName.trim() || undefined,
    };

    onCardDataChange([...cardData, card]);
    setNewCard({ name: '', image: '', englishName: '' });
    toast.success('卡片已新增');
  };

  const removeCard = (id: string) => {
    onCardDataChange(cardData.filter(card => card.id !== id));
    toast.success('卡片已刪除');
  };

  const generateAndCopyGameUrl = () => {
    if (cardData.length < 3) {
      toast.error('至少需要 3 張卡片才能生成遊戲網址');
      return;
    }

    try {
      const gameUrl = generateGameUrl(cardData);
      navigator.clipboard.writeText(gameUrl);
      toast.success('遊戲網址已複製到剪貼簿！\n您可以分享此網址給其他人直接遊玩');
    } catch (error) {
      toast.error('生成遊戲網址失敗');
    }
  };

  const downloadTemplate = () => {
    const csvContent = '名稱,圖片,英文名\n動物,🐱,Cat\n水果,🍎,Apple\n交通,🚗,Car';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'memory-game-template.csv';
    link.click();
    toast.success('範本已下載');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        if (headers.length < 2) {
          throw new Error('CSV 格式錯誤，至少需要名稱和圖片欄位');
        }

        const newCards: CardData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 2 && values[0].trim() && values[1].trim()) {
            newCards.push({
              id: `csv-${Date.now()}-${i}`,
              name: values[0].trim(),
              image: values[1].trim(),
              englishName: values[2]?.trim() || undefined,
            });
          }
        }

        if (newCards.length === 0) {
          throw new Error('未發現有效的卡片資料');
        }

        onCardDataChange([...cardData, ...newCards]);
        toast.success(`成功匯入 ${newCards.length} 張卡片`);
      } catch (error) {
        toast.error(`匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    };
    reader.readAsText(file);
  };

  const canStartGame = cardData.length >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-10">
      <div className="w-full max-w-4xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">返回首頁</span>
              <span className="sm:hidden">返回</span>
            </button>
            
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center flex-1 px-2">
              自定義遊戲內容
            </h2>
            
            <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Add New Card */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">新增卡片</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="名稱"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="圖片 (emoji或URL)"
                value={newCard.image}
                onChange={(e) => setNewCard({ ...newCard, image: e.target.value })}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="英文名 (可選)"
                value={newCard.englishName}
                onChange={(e) => setNewCard({ ...newCard, englishName: e.target.value })}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
              <button
                onClick={addCard}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                新增
              </button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">批量匯入</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                下載範本
              </button>
              <label className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer text-sm sm:text-base">
                <Upload className="w-4 h-4" />
                匯入 CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Card List */}
          {cardData.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                卡片列表 ({cardData.length} 張)
              </h3>
              <div className="grid gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto">
                {cardData.map((card) => (
                  <motion.div
                    key={card.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {card.image.startsWith('http') ? (
                          <img 
                            src={card.image} 
                            alt={card.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                          />
                        ) : (
                          card.image
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium text-sm sm:text-base truncate">{card.name}</div>
                        {card.englishName && (
                          <div className="text-white/60 text-xs sm:text-sm truncate">{card.englishName}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="p-1 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center">
            {/* Generate Game URL */}
            <button
              onClick={generateAndCopyGameUrl}
              disabled={cardData.length < 3}
              className={`flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                cardData.length >= 3
                  ? 'bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              生成遊戲網址
            </button>

            {/* Start Game */}
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className={`flex items-center justify-center gap-2 px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                canStartGame
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              開始遊戲
            </button>
          </div>

          {!canStartGame && (
            <p className="text-white/60 text-xs sm:text-sm text-center mt-3 sm:mt-4">至少需要 3 張卡片才能開始遊戲或生成網址</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManager;