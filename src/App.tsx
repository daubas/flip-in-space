import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StarField from './components/StarField';
import HomePage from './components/HomePage';
import ContentManager from './components/ContentManager';
import GameBoard from './components/GameBoard';
import AuthorPage from './components/AuthorPage';
import { useGameState } from './hooks/useGameState';
import { CardData } from './types/game';
import { fetchGoogleSheetData } from './services/googleSheets';
import { decodeCardData, isValidEncodedData } from './utils/urlGenerator';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// Component for handling Google Sheets route
const SheetGamePage: React.FC = () => {
  const { sheetId } = useParams<{ sheetId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { gameState, initializeGame, flipCard, resetGame } = useGameState();

  useEffect(() => {
    const loadSheetData = async () => {
      if (!sheetId) {
        navigate('/');
        return;
      }

      try {
        const cardData = await fetchGoogleSheetData(sheetId);
        initializeGame(cardData);
        toast.success(`成功載入 ${cardData.length} 張卡片`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '載入失敗');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadSheetData();
  }, [sheetId, navigate, initializeGame]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      onCardClick={flipCard}
      onReset={resetGame}
      onHome={() => navigate('/')}
    />
  );
};

// Component for handling encoded game data route
const EncodedGamePage: React.FC = () => {
  const { encodedData } = useParams<{ encodedData: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { gameState, initializeGame, flipCard, resetGame } = useGameState();

  useEffect(() => {
    const loadEncodedData = async () => {
      if (!encodedData) {
        navigate('/');
        return;
      }

      try {
        if (!isValidEncodedData(encodedData)) {
          throw new Error('無效的遊戲網址格式');
        }

        const cardData = decodeCardData(encodedData);
        
        if (cardData.length < 3) {
          throw new Error('遊戲資料不足，至少需要3張卡片');
        }

        initializeGame(cardData);
        toast.success(`成功載入 ${cardData.length} 張卡片`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '載入失敗';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // 延遲跳轉，讓用戶看到錯誤訊息
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    loadEncodedData();
  }, [encodedData, navigate, initializeGame]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-xl">載入遊戲中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold mb-4">載入失敗</div>
          <div className="text-lg mb-6 text-white/80">{error}</div>
          <div className="text-sm text-white/60">3秒後自動返回首頁...</div>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      onCardClick={flipCard}
      onReset={resetGame}
      onHome={() => navigate('/')}
    />
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'content' | 'game' | 'author'>('home');
  const [cardData, setCardData] = useState<CardData[]>([]);
  const { gameState, initializeGame, flipCard, resetGame } = useGameState();
  const navigate = useNavigate();

  const handleStartGame = (cards: CardData[]) => {
    setCardData(cards);
    initializeGame(cards);
    setCurrentPage('game');
  };

  const handleStartCustomGame = () => {
    setCurrentPage('content');
  };

  const handleShowAuthor = () => {
    setCurrentPage('author');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCardData([]);
  };

  const handleContentManagerStart = () => {
    if (cardData.length >= 3) {
      initializeGame(cardData);
      setCurrentPage('game');
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onStartCustomGame={handleStartCustomGame}
            onStartGame={handleStartGame}
            onShowAuthor={handleShowAuthor}
          />
        );
      case 'content':
        return (
          <ContentManager
            cardData={cardData}
            onCardDataChange={setCardData}
            onStartGame={handleContentManagerStart}
            onBack={handleBackToHome}
          />
        );
      case 'game':
        return (
          <GameBoard
            gameState={gameState}
            onCardClick={flipCard}
            onReset={resetGame}
            onHome={handleBackToHome}
          />
        );
      case 'author':
        return (
          <AuthorPage
            onBack={handleBackToHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StarField />
      {renderCurrentPage()}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen overflow-hidden">
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/game/:encodedData" element={
            <>
              <StarField />
              <EncodedGamePage />
            </>
          } />
          <Route path="/:sheetId" element={
            <>
              <StarField />
              <SheetGamePage />
            </>
          } />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;