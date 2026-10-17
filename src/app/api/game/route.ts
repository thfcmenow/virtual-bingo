import { NextResponse } from 'next/server';
import { getGameState, getClaims, getStorageBackend } from '@/lib/storage';
import { getConnectedClientCount } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [gameState, claims] = await Promise.all([getGameState(), getClaims()]);

    return NextResponse.json({
      gameState,
      claims,
      activeClients: getConnectedClientCount(),
      storageBackend: getStorageBackend(),
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json({ error: 'Failed to load game state' }, { status: 500 });
  }
}
