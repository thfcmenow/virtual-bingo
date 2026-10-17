import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { playVictoryFanfare } from '@/lib/sounds';
import { Award, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { BingoClaim } from '@/types/bingo';

interface BingoClaimButtonProps {
  playerId: string;
  onClaimSuccess?: (claim: BingoClaim) => void;
  activeClaim?: BingoClaim | null;
  disabled?: boolean;
}

export const BingoClaimButton: React.FC<BingoClaimButtonProps> = ({
  playerId,
  onClaimSuccess,
  activeClaim,
  disabled = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      // Multi-angle vibrant confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch {
      // Confetti fallback
    }
  };

  const handleClaim = async () => {
    if (!playerId || isSubmitting || disabled) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    // Immediate celebratory feedback
    triggerConfetti();
    playVictoryFanfare();

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit Bingo claim');
      }

      onClaimSuccess?.(data.claim);
    } catch (error: unknown) {
      console.error('Error claiming bingo:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error sending claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = activeClaim?.status === 'verified';
  const isPending = activeClaim?.status === 'pending';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Prominent BINGO Button */}
      <button
        type="button"
        onClick={handleClaim}
        disabled={isSubmitting || disabled}
        className={`relative group overflow-hidden w-full max-w-md py-5 sm:py-6 px-8 rounded-3xl font-black text-2xl sm:text-3xl tracking-widest uppercase transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 border-4 select-none ${
          isVerified
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white border-emerald-300 ring-8 ring-emerald-500/30'
            : isPending
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 border-amber-300 ring-8 ring-amber-500/30 animate-pulse'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:via-rose-500 hover:to-red-600 text-white border-red-300 ring-8 ring-red-500/20 hover:scale-[1.03] active:scale-[0.98]'
        }`}
        style={{
          boxShadow: isVerified
            ? '0 0 45px rgba(16, 185, 129, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.5)'
            : '0 0 35px rgba(239, 68, 68, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Shimmer light bar across button */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {isSubmitting ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            Claiming...
          </>
        ) : isVerified ? (
          <>
            <CheckCircle className="w-8 h-8" />
            BINGO VERIFIED!
          </>
        ) : (
          <>
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            B I N G O !
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
          </>
        )}
      </button>

      {/* Claim Status Message */}
      {activeClaim && (
        <div
          className={`mt-4 px-4 py-2.5 rounded-xl border text-center text-xs sm:text-sm font-semibold max-w-md w-full animate-pop-in ${
            isVerified
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : isPending
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          {isVerified ? (
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Congratulations! The Host verified your BINGO win!</span>
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>BINGO Alert Sent to Host screen! Awaiting verification...</span>
            </div>
          ) : (
            <span>Claim status: {activeClaim.status}</span>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-xs text-rose-400 font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
