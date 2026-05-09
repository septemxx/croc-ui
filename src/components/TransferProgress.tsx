import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatBytes, formatSpeed, formatTime } from '../utils/formatters';
import { TransferProgress as TransferProgressType } from '../store/transferStore';

interface TransferProgressProps {
  progress: TransferProgressType;
  mode: 'send' | 'receive';
}

export function TransferProgress({ progress, mode }: TransferProgressProps) {
  const isUploading = mode === 'send';

  return (
    <div className="text-center space-y-6">
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-dark-700"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={isUploading ? 'text-primary-500' : 'text-emerald-500'}
            strokeDasharray={440}
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 - (440 * progress.progress) / 100 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(progress.progress)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-white font-mono"
          >
            {Math.round(progress.progress)}%
          </motion.span>
          <span className="text-xs text-dark-400 mt-1">
            {isUploading ? '上传中' : '下载中'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-dark-300 font-mono truncate max-w-xs mx-auto">
          {progress.fileName}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-dark-400">
          <span className="text-sm">
            {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
          </span>
          <span className="text-dark-600">|</span>
          <span className="text-sm text-primary-400 font-mono">
            {formatSpeed(progress.speed)}
          </span>
        </div>

        <p className="text-xs text-dark-500">
          剩余时间: {formatTime(progress.remainingTime)}
        </p>
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'waiting' | 'connected' | 'error';
  message?: string;
}

export function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const config = {
    waiting: {
      icon: Loader2,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      text: '等待连接...',
    },
    connected: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      text: '已连接',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      text: '连接错误',
    },
  };

  const { icon: Icon, color, bgColor, borderColor, text } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgColor} border ${borderColor}`}
    >
      <Icon className={`w-5 h-5 ${color} ${status === 'waiting' ? 'animate-spin' : ''}`} />
      <div>
        <p className={`text-sm font-medium ${color}`}>{text}</p>
        {message && (
          <p className="text-xs text-dark-400 mt-0.5">{message}</p>
        )}
      </div>
    </motion.div>
  );
}
