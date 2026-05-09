import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useTransferStore } from '../store/transferStore';
import { generateCode } from '../utils/formatters';

interface SendResult {
  success: boolean;
  code?: string;
  error?: string;
}

interface ReceiveResult {
  success: boolean;
  error?: string;
}

interface ProgressPayload {
  progress: number;
  speed: number;
  transferred: number;
  total: number;
  file_name: string;
  remaining_time: number;
}

export function useTransfer() {
  const {
    files,
    saveDirectory,
    connectionCode,
    setConnectionCode,
    setProgress,
    setIsTransferring,
    setIsConnected,
    setError,
    reset,
  } = useTransferStore();

  const startSend = useCallback(async () => {
    if (files.length === 0) {
      setError('请先选择要发送的文件');
      return { success: false, error: 'No files selected' };
    }

    setError(null);
    setIsTransferring(true);

    try {
      const code = generateCode();
      const filePaths = files.map(f => f.path);
      
      const result = await invoke<SendResult>('start_send', {
        files: filePaths,
        code,
        port: 9009,
      });

      if (result.success && result.code) {
        setConnectionCode(result.code);
        setIsConnected(true);
        
        listen<ProgressPayload>('transfer-progress', (event) => {
          const payload = event.payload;
          setProgress({
            progress: payload.progress,
            speed: payload.speed,
            transferred: payload.transferred,
            total: payload.total,
            fileName: payload.file_name,
            remainingTime: payload.remaining_time,
          });
        });

        listen('transfer-completed', () => {
          setIsTransferring(false);
          setProgress(null);
        });

        listen<string>('transfer-error', (event) => {
          setError(event.payload);
          setIsTransferring(false);
        });

        return result;
      } else {
        setError(result.error || '发送失败');
        setIsTransferring(false);
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(errorMsg);
      setIsTransferring(false);
      return { success: false, error: errorMsg };
    }
  }, [files, setConnectionCode, setProgress, setIsTransferring, setIsConnected, setError]);

  const startReceive = useCallback(async () => {
    if (!connectionCode) {
      setError('请输入连接码');
      return { success: false, error: 'No connection code' };
    }

    if (!saveDirectory) {
      setError('请选择保存位置');
      return { success: false, error: 'No save directory' };
    }

    setError(null);
    setIsTransferring(true);

    try {
      const result = await invoke<ReceiveResult>('start_receive', {
        code: connectionCode,
        outputDir: saveDirectory,
        port: 9009,
      });

      if (result.success) {
        setIsConnected(true);

        listen<ProgressPayload>('transfer-progress', (event) => {
          const payload = event.payload;
          setProgress({
            progress: payload.progress,
            speed: payload.speed,
            transferred: payload.transferred,
            total: payload.total,
            fileName: payload.file_name,
            remainingTime: payload.remaining_time,
          });
        });

        listen('transfer-completed', () => {
          setIsTransferring(false);
          setProgress(null);
        });

        listen<string>('transfer-error', (event) => {
          setError(event.payload);
          setIsTransferring(false);
        });

        return result;
      } else {
        setError(result.error || '接收失败');
        setIsTransferring(false);
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(errorMsg);
      setIsTransferring(false);
      return { success: false, error: errorMsg };
    }
  }, [connectionCode, saveDirectory, setProgress, setIsTransferring, setIsConnected, setError]);

  const stopTransfer = useCallback(async () => {
    try {
      await invoke('stop_transfer');
      setIsTransferring(false);
      setProgress(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to stop transfer:', error);
    }
  }, [setIsTransferring, setProgress, setIsConnected]);

  return {
    startSend,
    startReceive,
    stopTransfer,
    reset,
  };
}
