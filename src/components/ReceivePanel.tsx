import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { motion } from 'framer-motion';
import { Download, FolderOpen, Play, X } from 'lucide-react';
import { useTransferStore } from '../store/transferStore';
import { useTransfer } from '../hooks/useTransfer';
import { TransferProgress, StatusIndicator } from './TransferProgress';

export function ReceivePanel() {
  const [codeInput, setCodeInput] = useState('');
  const {
    isTransferring,
    isConnected,
    saveDirectory,
    progress,
    error,
    setConnectionCode,
    setSaveDirectory,
  } = useTransferStore();
  const { startReceive, stopTransfer } = useTransfer();

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
      });
      
      if (selected && typeof selected === 'string') {
        setSaveDirectory(selected);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };

  const handleConnect = async () => {
    if (codeInput.length === 6) {
      setConnectionCode(codeInput.toLowerCase());
      await startReceive();
    }
  };

  const handleStop = async () => {
    await stopTransfer();
    setCodeInput('');
  };

  if (isTransferring && progress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 space-y-6"
      >
        <TransferProgress progress={progress} mode="receive" />
        
        {error && (
          <div className="mt-6">
            <StatusIndicator status="error" message={error} />
          </div>
        )}
        
        <button
          onClick={handleStop}
          className="w-full py-3 px-6 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium transition-all flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          取消接收
        </button>
      </motion.div>
    );
  }

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 space-y-6"
      >
        <StatusIndicator status="connected" message="已连接到发送方" />
        
        <div className="text-center py-4">
          <Download className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-lg text-white font-medium">准备接收文件</p>
          <p className="text-sm text-dark-400 mt-2">保存位置: {saveDirectory}</p>
        </div>
        
        <button
          onClick={handleStop}
          className="w-full py-3 px-6 rounded-xl bg-dark-700/50 hover:bg-dark-700 text-dark-300 font-medium transition-all"
        >
          取消
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-8 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">输入连接码</h2>
        <p className="text-sm text-dark-400">输入发送方提供的6位连接码</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toLowerCase().slice(0, 6))}
            placeholder="请输入连接码"
            maxLength={6}
            className="w-full py-4 px-6 rounded-xl bg-dark-800/50 border border-dark-600 text-white text-center text-2xl font-mono tracking-widest placeholder:text-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {codeInput.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dark-400"
            >
              {codeInput.length}/6
            </motion.div>
          )}
        </div>

        <div>
          <p className="text-sm text-dark-400 mb-3">选择保存位置</p>
          <button
            onClick={handleSelectFolder}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-xl bg-dark-800/50 border border-dark-600 hover:border-emerald-500/50 text-dark-300 transition-all"
          >
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            <span className="flex-1 text-left truncate">
              {saveDirectory || '点击选择保存位置'}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <StatusIndicator status="error" message={error} />
      )}

      <button
        onClick={handleConnect}
        disabled={codeInput.length !== 6 || !saveDirectory}
        className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          codeInput.length === 6 && saveDirectory
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white glow-button'
            : 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
        }`}
      >
        <Play className="w-5 h-5" />
        连接并接收
      </button>
    </motion.div>
  );
}
