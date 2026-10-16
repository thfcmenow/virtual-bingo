import { NextResponse } from 'next/server';
import { resetGameState } from '@/lib/storage';
import { broadcastSSE } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const newState = await resetGameState();

    // Broadcast reset to all clients
    broadcastSSE('GAME_RESET', {
      message: 'The game has been reset by the Admin.',
      gameState: newState,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Game reset successfully',
      gameState: newState,
    });
  } catch (error) {
    console.error('Error resetting game:', error);
    return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}
