import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, savePlayer } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { row, col, daubed } = await req.json();

    if (
      typeof row !== 'number' ||
      typeof col !== 'number' ||
      row < 0 ||
      row > 4 ||
      col < 0 ||
      col > 4
    ) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const player = await getPlayer(params.id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Keep center free space always true
    if (row === 2 && col === 2) {
      player.daubed[2][2] = true;
    } else {
      player.daubed[row][col] = Boolean(daubed);
    }

    await savePlayer(player);

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error('Error updating daub state:', error);
    return NextResponse.json({ error: 'Failed to update daub state' }, { status: 500 });
  }
}
