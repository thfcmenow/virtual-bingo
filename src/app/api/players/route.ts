import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, savePlayer } from '@/lib/storage';
import { generateBingoCard, createInitialDaubedMatrix } from '@/lib/bingoLogic';
import { Player } from '@/types/bingo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, playerId, avatarSeed, color } = body;

    // Check if player ID was provided and already exists
    if (playerId) {
      const existing = await getPlayer(playerId);
      if (existing) {
        // If name changed, update it
        if (name && name !== existing.name) {
          existing.name = name.trim();
          await savePlayer(existing);
        }
        return NextResponse.json({ player: existing, isNew: false });
      }
    }

    // Generate new unique player ID
    const newId =
      playerId && typeof playerId === 'string' && playerId.trim().length > 0
        ? playerId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        : `player_${Math.random().toString(36).substring(2, 8)}`;

    const playerName = (name && typeof name === 'string' && name.trim()) || `Lucky Player ${newId.slice(-4)}`;

    const card = generateBingoCard();
    const daubed = createInitialDaubedMatrix();

    const newPlayer: Player = {
      id: newId,
      name: playerName,
      card,
      daubed,
      createdAt: new Date().toISOString(),
      avatarSeed: avatarSeed || Math.random().toString(36).substring(2, 6),
      color: color || '#3b82f6',
    };

    await savePlayer(newPlayer);

    return NextResponse.json({ player: newPlayer, isNew: true });
  } catch (error) {
    console.error('Error creating/loading player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
