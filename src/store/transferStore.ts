import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
}

export interface TransferProgress {
  progress: number;
  speed: number;
  transferred: number;
  total: number;
  fileName: string;
  remainingTime: number;
}

interface TransferStore {
  mode: 'send' | 'receive';
  isConnected: boolean;
  isTransferring: boolean;
  connectionCode: string | null;
  files: FileItem[];
  saveDirectory: string;
  progress: TransferProgress | null;
  error: string | null;
  crocInstalled: boolean;
  crocVersion: string | null;
  
  setMode: (mode: 'send' | 'receive') => void;
  setConnectionCode: (code: string | null) => void;
  addFiles: (files: FileItem[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setSaveDirectory: (dir: string) => void;
  setProgress: (progress: TransferProgress | null) => void;
  setIsTransferring: (transferring: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setCrocStatus: (installed: boolean, version: string | null) => void;
  reset: () => void;
}

const initialState = {
  mode: 'send' as const,
  isConnected: false,
  isTransferring: false,
  connectionCode: null,
  files: [],
  saveDirectory: '',
  progress: null,
  error: null,
  crocInstalled: false,
  crocVersion: null,
};

export const useTransferStore = create<TransferStore>((set) => ({
  ...initialState,
  
  setMode: (mode) => set({ mode, connectionCode: null, error: null, progress: null }),
  
  setConnectionCode: (code) => set({ connectionCode: code }),
  
  addFiles: (newFiles) => set((state) => {
    const existingPaths = new Set(state.files.map(f => f.path));
    const uniqueFiles = newFiles.filter(f => !existingPaths.has(f.path));
    return { files: [...state.files, ...uniqueFiles] };
  }),
  
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id)
  })),
  
  clearFiles: () => set({ files: [] }),
  
  setSaveDirectory: (dir) => set({ saveDirectory: dir }),
  
  setProgress: (progress) => set({ progress }),
  
  setIsTransferring: (transferring) => set({ isTransferring: transferring }),
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  
  setError: (error) => set({ error }),
  
  setCrocStatus: (installed, version) => set({ crocInstalled: installed, crocVersion: version }),
  
  reset: () => set({ ...initialState, crocInstalled: initialState.crocInstalled }),
}));
