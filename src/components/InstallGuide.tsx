import { AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface InstallGuideProps {
  onRetry: () => void;
}

export function InstallGuide({ onRetry }: InstallGuideProps) {
  const getInstallCommands = () => {
    const platform = navigator.userAgent;
    let commands: string[] = [];
    
    if (platform.includes('Windows')) {
      commands = [
        'scoop install croc',
        '或者下载安装包: https://github.com/schollz/croc/releases',
      ];
    } else if (platform.includes('Mac')) {
      commands = [
        'brew install croc',
      ];
    } else {
      commands = [
        'curl https://getcroc.schollz.com | sh',
        '或者使用包管理器: sudo apt install croc',
      ];
    }
    
    return commands;
  };

  const commands = getInstallCommands();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>

      <h2 className="text-xl font-semibold text-white mb-3">
        croc 未安装
      </h2>
      
      <p className="text-dark-400 mb-6">
        请先安装 croc 命令行工具才能使用本应用
      </p>

      <div className="bg-dark-900/50 rounded-xl p-4 mb-6 text-left">
        <p className="text-sm text-dark-300 mb-3">安装命令:</p>
        {commands.map((cmd, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 mb-2 last:mb-0"
          >
            <span className="text-primary-400 mt-1">$</span>
            <code className="text-sm font-mono text-emerald-400 flex-1">
              {cmd}
            </code>
          </div>
        ))}
      </div>

      <button
        onClick={onRetry}
        className="w-full py-3 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all glow-button flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        我已安装，重试
      </button>
    </motion.div>
  );
}
