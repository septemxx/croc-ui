import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="flex items-center justify-center py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-xl bg-primary-500/20 backdrop-blur-sm">
          <Shield className="w-8 h-8 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-wider">
            CROC UI
          </h1>
          <p className="text-xs text-dark-400 font-mono tracking-widest">
            SECURE FILE TRANSFER
          </p>
        </div>
      </motion.div>
    </header>
  );
}
