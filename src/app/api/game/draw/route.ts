import { NextResponse } from 'next/server';
import { drawNextBall } from '@/lib/storage';
import { broadcastSSE } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { state, ball } = await drawNextBall();

    if (!ball) {
      return NextResponse.json(
        {
          success: false,
          message: 'All 75 numbers have already been called!',
          gameState: state,
        },
        { status: 400 }
      );
    }

    // Broadcast the drawn ball to all clients instantly
    broadcastSSE('BALL_DRAWN', {
      ball,
      calledNumbers: state.calledNumbers,
      gameState: state,
    });

    return NextResponse.json({
      success: true,
      ball,
      gameState: state,
    });
  } catch (error) {
    console.error('Error drawing ball:', error);
    return NextResponse.json({ error: 'Failed to draw ball' }, { status: 500 });
  }
}
