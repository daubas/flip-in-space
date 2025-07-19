import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, ExternalLink, Loader, AlertCircle, Share2, User, FileText } from 'lucide-react';
import { CardData } from '../types/game';
import { fetchGoogleSheetData } from '../services/googleSheets';
import { generateGameUrl } from '../utils/urlGenerator';
import toast from 'react-hot-toast';

interface HomePageProps {
  onStartCustomGame: () => void;
  onStartGame: (cardData: CardData[]) => void;
  onShowAuthor: () => void;
}

const defaultCards: CardData[] = [
  { id: '1', name: '貓咪', image: '🐱', englishName: 'Cat' },
  { id: '2', name: '狗狗', image: '🐶', englishName: 'Dog' },
  { id: '3', name: '蘋果', image: '🍎', englishName: 'Apple' },
  { id: '4', name: '香蕉', image: '🍌', englishName: 'Banana' },
  { id: '5', name: '汽車', image: '🚗', englishName: 'Car' },
  { id: '6', name: '飛機', image: '✈️', englishName: 'Airplane' },
];

const HomePage: React.FC<HomePageProps> = ({ onStartCustomGame, onStartGame, onShowAuthor }) => {
  const [sheetInput, setSheetInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loadedCardData, setLoadedCardData] = useState<CardData[] | null>(null);
  const [gameUrl, setGameUrl] = useState<string>('');
  const [sheetInfo, setSheetInfo] = useState<{
    title: string;
    sheetName?: string;
    totalCards: number;
    sampleCards: CardData[];
  } | null>(null);

  const handleGoogleSheetLoad = async () => {
    if (!sheetInput.trim()) {
      toast.error('請輸入 Google Sheets ID 或連結');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchGoogleSheetData(sheetInput.trim());
      setLoadedCardData(result.cardData);
      
      // 設定試算表資訊
      setSheetInfo({
        title: result.sheetInfo.title,
        sheetName: result.sheetInfo.sheetName,
        totalCards: result.cardData.length,
        sampleCards: result.cardData.slice(0, 3), // 顯示前3張卡片作為預覽
      });
      
      // 生成遊戲網址
      const url = generateGameUrl(result.cardData);
      setGameUrl(url);
      
      toast.success(`成功載入 ${result.cardData.length} 張卡片`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入失敗';
      toast.error(errorMessage, {
        duration: 8000,
        style: {
          maxWidth: '600px',
          whiteSpace: 'pre-line',
        },
      });
      setLoadedCardData(null);
      setGameUrl('');
      setSheetInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLoadedGame = () => {
    if (loadedCardData) {
      onStartGame(loadedCardData);
    }
  };

  const copyGameUrl = async () => {
    if (gameUrl) {
      try {
        await navigator.clipboard.writeText(gameUrl);
        toast.success('遊戲網址已複製到剪貼簿！\n您可以分享此網址給其他人直接遊玩');
      } catch (error) {
        // 如果剪貼簿 API 失敗，使用備用方法
        const textArea = document.createElement('textarea');
        textArea.value = gameUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('遊戲網址已複製到剪貼簿！\n您可以分享此網址給其他人直接遊玩');
        } catch (fallbackError) {
          toast.error('複製失敗，請手動複製網址');
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoogleSheetLoad();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-10">
      <motion.div
        className="w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Author Button */}
        <motion.div
          className="absolute top-2 right-2 sm:top-4 sm:right-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <button
            onClick={onShowAuthor}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-white border border-white/20 text-sm sm:text-base"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">作者介紹</span>
            <span className="sm:hidden">作者</span>
          </button>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          🚀 太空記憶翻牌遊戲
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          在浩瀚宇宙中挑戰你的記憶力
        </motion.p>

        {/* Game Options */}
        <div className="space-y-4 sm:space-y-6">
          {/* Default Game */}
          <motion.button
            onClick={() => onStartGame(defaultCards)}
            className="w-full p-4 sm:p-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2 sm:mr-3" />
            開始遊戲（預設內容）
          </motion.button>

          {/* Custom Game */}
          <motion.button
            onClick={onStartCustomGame}
            className="w-full p-4 sm:p-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-300 border border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2 sm:mr-3" />
            自定義遊戲內容
          </motion.button>

          {/* Google Sheets Integration */}
          <motion.div
            className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                從 Google Sheets 載入內容
              </h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-300">
                  API: 已設定
                </div>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 text-white/60 hover:text-white/80 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                type="text"
                placeholder="貼上完整的 Google Sheets 連結"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
              <button
                onClick={handleGoogleSheetLoad}
                disabled={isLoading}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                載入
              </button>
            </div>

            {/* Sheet Info Display */}
            {sheetInfo && (
              <motion.div
                className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                  <h4 className="text-blue-300 font-medium text-sm sm:text-base">試算表內容預覽</h4>
                </div>
                
                <div className="text-white/90 text-xs sm:text-sm space-y-2">
                  <p><strong>試算表名稱：</strong>{sheetInfo.title}</p>
                  {sheetInfo.sheetName && (
                    <p><strong>工作表：</strong>{sheetInfo.sheetName}</p>
                  )}
                  <p><strong>總卡片數：</strong>{sheetInfo.totalCards} 張</p>
                  
                  <div>
                    <p className="font-medium mb-2">內容範例：</p>
                    <div className="bg-black/20 rounded p-2 sm:p-3 space-y-1">
                      {sheetInfo.sampleCards.map((card, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs">
                          <span className="text-lg sm:text-2xl">
                            {card.image.startsWith('http') ? '🖼️' : card.image}
                          </span>
                          <span className="text-white truncate flex-1">{card.name}</span>
                          {card.englishName && (
                            <span className="text-white/60 text-xs hidden sm:inline">({card.englishName})</span>
                          )}
                        </div>
                      ))}
                      {sheetInfo.totalCards > 3 && (
                        <div className="text-white/60 text-xs">
                          ... 還有 {sheetInfo.totalCards - 3} 張卡片
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loaded Game Actions */}
            {loadedCardData && gameUrl && (
              <motion.div
                className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-green-300 font-medium text-sm sm:text-base">
                    ✅ 已載入 {loadedCardData.length} 張卡片
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleStartLoadedGame}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4" />
                    開始遊戲
                  </button>
                  
                  <button
                    onClick={copyGameUrl}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 font-medium transition-all text-sm sm:text-base"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">複製遊戲網址</span>
                    <span className="sm:hidden">複製網址</span>
                  </button>
                </div>
                
                <div className="mt-3 text-xs text-green-200/80">
                  💡 遊戲網址可以直接分享給其他人，他們點選後就能直接遊玩相同內容
                </div>
              </motion.div>
            )}

            {/* Help Section */}
            {showHelp && (
              <motion.div
                className="bg-white/5 rounded-lg p-3 sm:p-4 text-left"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="text-white/80 text-xs sm:text-sm space-y-4">
                  <div>
                    <p className="font-medium text-red-300 mb-2">🚨 重要：權限設定</p>
                    <div className="bg-red-900/20 border border-red-500/30 rounded p-2 sm:p-3 mb-3">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>開啟您的 Google Sheets</li>
                        <li>點選右上角「<strong>共用</strong>」按鈕</li>
                        <li>點選「<strong>變更</strong>」連結（在「限制」旁邊）</li>
                        <li>選擇「<strong>知道連結的任何人</strong>」</li>
                        <li>權限設為「<strong>檢視者</strong>」</li>
                        <li>點選「<strong>完成</strong>」</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-blue-300 mb-2">🔑 API 金鑰狀態</p>
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 sm:p-3 mb-3">
                      <p className="text-sm">
                        目前使用內建的測試 API 金鑰。如果遇到使用限制，請：
                      </p>
                      <ol className="list-decimal list-inside space-y-1 mt-2 text-sm">
                        <li>前往 <a href="https://console.cloud.google.com" target="_blank" className="text-blue-300 underline">Google Cloud Console</a></li>
                        <li>建立專案並啟用 Google Sheets API</li>
                        <li>建立 API 金鑰</li>
                        <li>在 .env 檔案中設定：VITE_GOOGLE_SHEETS_API_KEY=你的金鑰</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-blue-300 mb-2">📝 資料格式範例：</p>
                    <div className="bg-black/30 rounded p-2 sm:p-3 font-mono text-xs overflow-x-auto">
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 font-bold text-yellow-300 min-w-max">
                        <div>名字</div>
                        <div>圖片</div>
                        <div>英文名（可選）</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-1 min-w-max">
                        <div>陳保羅</div>
                        <div>https://...</div>
                        <div>Paul</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-1 min-w-max">
                        <div>貓咪</div>
                        <div>🐱</div>
                        <div>Cat</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 min-w-max">
                        <div>蘋果</div>
                        <div>🍎</div>
                        <div>Apple</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-green-300 mb-2">✅ 支援格式：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>完整 Google Sheets 連結（推薦）</li>
                      <li>包含特定工作表的連結（gid 參數）</li>
                      <li>圖片可以是 emoji 或網址</li>
                      <li>支援 Tab 分隔和逗號分隔</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {!showHelp && (
              <div className="text-white/60 text-xs sm:text-sm">
                <p>💡 點選右側 <AlertCircle className="w-4 h-4 inline" /> 圖示查看詳細說明</p>
                <p className="text-red-300 mt-1">⚠️ 請確保試算表已設為公開</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-8 sm:mt-12 text-white/60 text-xs sm:text-sm px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p>遊戲規則：翻開卡片找到名稱與圖片的配對</p>
          <p>完成所有配對即可獲勝！</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;