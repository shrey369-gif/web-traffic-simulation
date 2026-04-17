import { NextResponse } from 'next/server';
import { getJavaFallbackService } from '@/lib/java-fallback';

export async function GET() {
  const javaService = getJavaFallbackService();
  const isHealthy = await javaService.checkHealth();

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'fallback',
      backend: javaService.getStatus(),
      timestamp: new Date().toISOString(),
    },
    {
      status: isHealthy ? 200 : 503,
    }
  );
}
