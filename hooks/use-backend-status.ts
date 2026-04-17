'use client';

import { useState, useEffect } from 'react';
import { getJavaFallbackService } from '@/lib/java-fallback';

interface BackendStatus {
  available: boolean;
  url: string;
  lastCheck?: Date;
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    available: false,
    url: '',
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      setIsChecking(true);
      const javaService = getJavaFallbackService();
      const isAvailable = await javaService.checkHealth();

      setStatus({
        available: isAvailable,
        url: javaService.getStatus().url,
        lastCheck: new Date(),
      });
      setIsChecking(false);
    };

    checkBackend();

    // Start periodic checks
    const javaService = getJavaFallbackService();
    javaService.startHealthChecks(30000);

    return () => {
      javaService.stopHealthChecks();
    };
  }, []);

  return { ...status, isChecking };
}
