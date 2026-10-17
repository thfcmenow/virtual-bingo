import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, getGameState, saveClaim, getClaims } from '@/lib/storage';
import { verifyBingoCard } from '@/lib/bingoLogic';
import { broadcastSSE } from '@/lib/sse';
import { BingoClaim } from '@/types/bingo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const claims = await getClaims();
    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error getting claims:', error);
    return NextResponse.json({ error: 'Failed to retrieve claims' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const [player, gameState] = await Promise.all([
      getPlayer(playerId),
      getGameState(),
    ]);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Verify player card against the server's called numbers
    const verification = verifyBingoCard(
      player.card,
      player.daubed,
      gameState.calledNumbers
    );

    const winningNames = verification.winningPatterns.map((p) => p.name).join(', ');
    const allWinningNumbers = Array.from(
      new Set(verification.winningPatterns.flatMap((p) => p.numbers).filter((n) => n > 0))
    );

    const claim: BingoClaim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: player.id,
      playerName: player.name,
      timestamp: Date.now(),
      status: 'pending',
      patternName: winningNames || (verification.hasBingo ? 'Valid Bingo' : 'Unconfirmed Claim'),
      winningNumbers: allWinningNumbers,
      isLegitBingo: verification.hasBingo,
      uncalledDaubCount: verification.uncalledDaubs.length,
      cardSnapshot: player.card,
      daubedSnapshot: player.daubed,
    };

    // Persist the claim and its audit snapshot in Postgres
    await saveClaim(claim);

    // Broadcast immediately to Admin and all clients via SSE
    broadcastSSE('BINGO_CLAIMED', claim);

    return NextResponse.json({
      success: true,
      claim,
      verification,
    });
  } catch (error) {
    console.error('Error claiming bingo:', error);
    return NextResponse.json({ error: 'Failed to claim bingo' }, { status: 500 });
  }
}
