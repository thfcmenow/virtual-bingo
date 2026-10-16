import { NextRequest, NextResponse } from 'next/server';
import { updateClaimStatus } from '@/lib/storage';
import { broadcastSSE } from '@/lib/sse';
import { BingoClaim } from '@/types/bingo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { claimId, status } = await req.json();

    if (!claimId || !status) {
      return NextResponse.json(
        { error: 'claimId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses: BingoClaim['status'][] = ['verified', 'rejected', 'cleared', 'pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedClaim = await updateClaimStatus(claimId, status);

    if (!updatedClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Broadcast claim update
    broadcastSSE('CLAIM_UPDATED', updatedClaim);

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Error verifying claim:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
