import { motion } from 'framer-motion';
import { Send, Download } from 'lucide-react';
import { useTransferStore } from '../store/transferStore';

export function ModeSelector() {
  const { mode, setMode, isTransferring } = useTransferStore();

  return (
    <div className="flex justify-center gap-2 p-1 bg-dark-800/50 rounded-xl backdrop-blur-sm border border-dark-700">
      <button
        onClick={() => !isTransferring && setMode('send')}
        disabled={isTransferring}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
          mode === 'send'
            ? 'text-white'
            : 'text-dark-400 hover:text-dark-200'
        } ${isTransferring ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {mode === 'send' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary-500/20 rounded-lg border border-primary-500/50"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Send className="w-4 h-4" />
          发送
        </span>
      </button>
      
      <button
        onClick={() => !isTransferring && setMode('receive')}
        disabled={isTransferring}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
          mode === 'receive'
            ? 'text-white'
            : 'text-dark-400 hover:text-dark-200'
        } ${isTransferring ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {mode === 'receive' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-emerald-500/20 rounded-lg border border-emerald-500/50"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Download className="w-4 h-4" />
          接收
        </span>
      </button>
    </div>
  );
}
