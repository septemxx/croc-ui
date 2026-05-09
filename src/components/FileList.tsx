import { FolderOpen, Trash2, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from '../store/transferStore';
import { formatBytes } from '../utils/formatters';

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function FileList({ files, onRemove, onClear }: FileListProps) {
  if (files.length === 0) return null;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-dark-400">
          已选择 {files.length} 个文件 ({formatBytes(totalSize)})
        </span>
        <button
          onClick={onClear}
          className="text-xs text-dark-500 hover:text-red-400 transition-colors"
        >
          清除全部
        </button>
      </div>
      
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-700 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex-shrink-0">
                {file.name.includes('.') ? (
                  <File className="w-5 h-5 text-primary-400" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dark-200 truncate font-mono">
                  {file.name}
                </p>
                <p className="text-xs text-dark-500">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={() => onRemove(file.id)}
                className="flex-shrink-0 p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
