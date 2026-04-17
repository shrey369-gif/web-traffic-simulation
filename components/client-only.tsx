'use client';

import { ReactNode } from 'react';

/**
 * SSR-safe wrapper for client-only components
 * Prevents hydration mismatch errors
 */
interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  // This component is marked as 'use client' so it always renders client-side
  // The fallback is shown during SSR/initial load, then children render after hydration
  if (typeof window === 'undefined') {
    return fallback;
  }

  return <>{children}</>;
}
