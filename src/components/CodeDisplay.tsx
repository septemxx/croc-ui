import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { copyToClipboard } from '../utils/formatters';

interface CodeDisplayProps {
  code: string;
  label?: string;
}

export function CodeDisplay({ code, label = '连接码' }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-dark-400 mb-3">{label}</p>
      <div className="relative">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-4 py-6 px-8 rounded-2xl bg-dark-800/60 backdrop-blur-sm border border-primary-500/30"
        >
          <span className="code-display text-4xl font-bold text-white tracking-widest">
            {code.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </motion.div>
        
        <button
          onClick={handleCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-dark-700/50 hover:bg-primary-500/20 text-dark-400 hover:text-primary-400 transition-all"
        >
          {copied ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-dark-500 mt-3">
        {copied ? '已复制到剪贴板' : '点击复制连接码'}
      </p>
    </div>
  );
}
