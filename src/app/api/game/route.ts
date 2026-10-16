import { NextResponse } from 'next/server';
import { getGameState, getClaims, getBingoDataDir } from '@/lib/storage';
import { getConnectedClientCount } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [gameState, claims, dataDir] = await Promise.all([
      getGameState(),
      getClaims(),
      getBingoDataDir(),
    ]);

    return NextResponse.json({
      gameState,
      claims,
      activeClients: getConnectedClientCount(),
      dataDir,
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json({ error: 'Failed to load game state' }, { status: 500 });
  }
}
