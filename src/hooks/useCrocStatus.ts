import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTransferStore } from '../store/transferStore';

interface CrocStatus {
  installed: boolean;
  version: string | null;
}

export function useCrocStatus() {
  const { setCrocStatus, crocInstalled, crocVersion } = useTransferStore();

  const checkCroc = useCallback(async () => {
    try {
      const status = await invoke<CrocStatus>('check_croc_installed');
      setCrocStatus(status.installed, status.version);
      return status;
    } catch (error) {
      console.error('Failed to check croc status:', error);
      setCrocStatus(false, null);
      return { installed: false, version: null };
    }
  }, [setCrocStatus]);

  useEffect(() => {
    checkCroc();
  }, [checkCroc]);

  return { checkCroc, crocInstalled, crocVersion };
}
