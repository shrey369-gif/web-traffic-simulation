import { NextResponse } from 'next/server';
import { getJavaFallbackService } from '@/lib/java-fallback';

export async function POST(request: Request) {
  const { roadNetwork, parameters, duration } = await request.json();

  const javaService = getJavaFallbackService();
  const result = await javaService.simulateScenario(roadNetwork, parameters, duration);

  if (result) {
    return NextResponse.json({ success: true, data: result, source: 'java-backend' });
  }

  // Fall back to client-side indication
  return NextResponse.json(
    {
      success: true,
      data: null,
      source: 'client-side',
      message: 'Java backend unavailable, use client-side simulation',
    },
    { status: 200 }
  );
}
