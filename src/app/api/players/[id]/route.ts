import { NextRequest, NextResponse } from 'next/server';
import { getPlayer } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await getPlayer(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error getting player:', error);
    return NextResponse.json({ error: 'Failed to retrieve player' }, { status: 500 });
  }
}
