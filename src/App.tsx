import { AnimatePresence, motion } from 'framer-motion';
import { useTransferStore } from './store/transferStore';
import { useCrocStatus } from './hooks/useCrocStatus';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { SendPanel } from './components/SendPanel';
import { ReceivePanel } from './components/ReceivePanel';
import { InstallGuide } from './components/InstallGuide';

function App() {
  const { mode, crocInstalled } = useTransferStore();
  const { checkCroc } = useCrocStatus();

  if (!crocInstalled) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Header />
          <div className="mt-8">
            <InstallGuide onRetry={checkCroc} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-start px-4 pb-8">
        <div className="w-full max-w-md mt-4">
          <ModeSelector />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              {mode === 'send' ? <SendPanel /> : <ReceivePanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-dark-600 font-mono">
          Powered by croc · 端到端加密传输
        </p>
      </footer>
    </div>
  );
}

export default App;
