import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Instagram } from 'lucide-react';

interface AuthorPageProps {
  onBack: () => void;
}

const AuthorPage: React.FC<AuthorPageProps> = ({ onBack }) => {
  const handleEmailClick = () => {
    window.open('mailto:daubas.chen@gmail.com', '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/paulchenig', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-10">
      <motion.div
        className="w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">返回首頁</span>
              <span className="sm:hidden">返回</span>
            </button>
            
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center flex-1 px-2">
              作者介紹
            </h2>
            
            <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Author Information */}
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Avatar and Name */}
            <div className="text-center">
              <div className="text-6xl sm:text-7xl md:text-8xl mb-4">👨‍💻</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">陳保羅</h3>
              <p className="text-lg sm:text-xl text-white/80">遊戲作者</p>
            </div>

            {/* Description */}
            <motion.div
              className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                歡迎來到太空記憶翻牌遊戲！這是一個結合學習與娛樂的記憶力訓練遊戲。
                希望這個遊戲能為您帶來樂趣，同時提升記憶力和專注力。
              </p>
            </motion.div>

            {/* Contact Information */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">聯絡方式</h4>
              
              <motion.button
                onClick={handleEmailClick}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="break-all">daubas.chen@gmail.com</span>
              </motion.button>

              <motion.button
                onClick={handleInstagramClick}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>@paulchenig</span>
              </motion.button>
            </div>

            {/* Feedback Section */}
            <motion.div
              className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <h4 className="text-base sm:text-lg font-semibold text-green-300 mb-2 sm:mb-3">💬 內容回饋</h4>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                如果您有任何建議、問題或想法，歡迎透過上述聯絡方式與我分享。
                您的回饋對於改善遊戲體驗非常重要！
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthorPage;