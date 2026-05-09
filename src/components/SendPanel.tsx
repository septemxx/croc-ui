import { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { motion } from 'framer-motion';
import { Upload, FolderPlus, Play, X } from 'lucide-react';
import { useTransferStore, FileItem } from '../store/transferStore';
import { useTransfer } from '../hooks/useTransfer';
import { FileList } from './FileList';
import { CodeDisplay } from './CodeDisplay';
import { TransferProgress, StatusIndicator } from './TransferProgress';

export function SendPanel() {
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    isTransferring,
    isConnected,
    connectionCode,
    progress,
    error,
  } = useTransferStore();
  const { startSend, stopTransfer } = useTransfer();

  const handleSelectFiles = useCallback(async () => {
    try {
      const selected = await open({
        multiple: true,
        directory: false,
      });
      
      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        const fileItems: FileItem[] = paths.map((path, index) => ({
          id: `${Date.now()}-${index}`,
          name: path.split(/[\\/]/).pop() || path,
          path,
          size: 0,
        }));
        addFiles(fileItems);
      }
    } catch (err) {
      console.error('Failed to select files:', err);
    }
  }, [addFiles]);

  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
      });
      
      if (selected && typeof selected === 'string') {
        const fileItems: FileItem[] = [{
          id: `${Date.now()}`,
          name: selected.split(/[\\/]/).pop() || selected,
          path: selected,
          size: 0,
        }];
        addFiles(fileItems);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  }, [addFiles]);

  const handleSend = async () => {
    await startSend();
  };

  const handleStop = async () => {
    await stopTransfer();
  };

  if (isTransferring && progress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8"
      >
        <TransferProgress progress={progress} mode="send" />
        
        {error && (
          <div className="mt-6">
            <StatusIndicator status="error" message={error} />
          </div>
        )}
        
        <button
          onClick={handleStop}
          className="mt-8 w-full py-3 px-6 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium transition-all flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          取消传输
        </button>
      </motion.div>
    );
  }

  if (isConnected && connectionCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 space-y-6"
      >
        <StatusIndicator status="connected" message="等待接收方连接..." />
        
        <CodeDisplay code={connectionCode} label="分享此连接码给接收方" />
        
        <button
          onClick={handleStop}
          className="w-full py-3 px-6 rounded-xl bg-dark-700/50 hover:bg-dark-700 text-dark-300 font-medium transition-all"
        >
          取消发送
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
        <h2 className="text-xl font-semibold text-white mb-2">选择要发送的文件</h2>
        <p className="text-sm text-dark-400">拖放文件或点击下方按钮选择</p>
      </div>

      <div className="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors">
        <Upload className="w-12 h-12 text-dark-500 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">支持文件和文件夹</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleSelectFiles}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/50 text-primary-400 font-medium transition-all glow-button"
          >
            <FolderPlus className="w-4 h-4" />
            选择文件
          </button>
          <button
            onClick={handleSelectFolder}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 text-dark-300 font-medium transition-all"
          >
            选择文件夹
          </button>
        </div>
      </div>

      <FileList
        files={files}
        onRemove={removeFile}
        onClear={clearFiles}
      />

      {error && (
        <StatusIndicator status="error" message={error} />
      )}

      <button
        onClick={handleSend}
        disabled={files.length === 0}
        className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          files.length > 0
            ? 'bg-primary-500 hover:bg-primary-600 text-white glow-button'
            : 'bg-dark-700/50 text-dark-500 cursor-not-allowed'
        }`}
      >
        <Play className="w-5 h-5" />
        开始发送
      </button>
    </motion.div>
  );
}
