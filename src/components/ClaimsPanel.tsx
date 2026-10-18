import React, { useEffect, useState } from 'react';
import { BingoClaim, BingoLetter } from '@/types/bingo';
import { Bell, CheckCircle2, XCircle, Trash2, Eye, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ClaimsPanelProps {
  claims: BingoClaim[];
  onVerifyClaim: (claimId: string, status: BingoClaim['status']) => void;
  calledNumbers: number[];
}

export const ClaimsPanel: React.FC<ClaimsPanelProps> = ({
  claims,
  onVerifyClaim,
  calledNumbers,
}) => {
  const [inspectingClaim, setInspectingClaim] = useState<BingoClaim | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const calledSet = new Set(calledNumbers);

  const formatTimestamp = (ts: number) => {
    if (now === 0) return 'Just now';
    const seconds = Math.floor((now - ts) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bell className="w-5 h-5" />
            {pendingClaims.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                {pendingClaims.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Bingo Claims & Alerts
              {pendingClaims.length > 0 && (
                <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  {pendingClaims.length} Action Needed
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Claims and audit snapshots use the configured storage backend
            </p>
          </div>
        </div>

        {claims.length > 0 && (
          <button
            type="button"
            onClick={() => {
              claims.forEach((c) => onVerifyClaim(c.id, 'cleared'));
            }}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors p-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <Award className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-medium">No Bingo claims submitted yet.</p>
          <p className="text-xs text-slate-600 mt-1">
            When a player hits &quot;BINGO!&quot; on their device, an instant alert will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {claims.map((claim) => {
            const isPending = claim.status === 'pending';
            const isVerified = claim.status === 'verified';
            const isRejected = claim.status === 'rejected';

            return (
              <div
                key={claim.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                    : isVerified
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isRejected
                    ? 'bg-red-950/20 border-red-900/40 opacity-75'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {claim.playerName}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                      {claim.playerId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(claim.timestamp)}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isRejected
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPending && <AlertTriangle className="w-3 h-3" />}
                      {isVerified && <ShieldCheck className="w-3 h-3" />}
                      {isRejected && <XCircle className="w-3 h-3" />}
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Pattern & Analysis info */}
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 my-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-400">Claimed Pattern: </span>
                    <span className="font-semibold text-amber-300">
                      {claim.patternName || 'Standard Line'}
                    </span>
                  </div>
                  {claim.isLegitBingo !== undefined && (
                    <div>
                      <span className="text-slate-400">Server Audit: </span>
                      {claim.isLegitBingo ? (
                        <span className="text-emerald-400 font-bold">
                          ✓ Valid Numbers Called
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold">
                          ⚠ Uncalled daubs detected ({claim.uncalledDaubCount || 0})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setInspectingClaim(claim)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Card
                  </button>

                  <button
                    type="button"
                    onClick={() => onVerifyClaim(claim.id, 'verified')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-950/50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify & Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => onVerifyClaim(claim.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-800/60"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => onVerifyClaim(claim.id, 'cleared')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Card Modal */}
      {inspectingClaim && inspectingClaim.cardSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">
                  Auditing Card: {inspectingClaim.playerName}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {inspectingClaim.playerId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingClaim(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Snapshot Card Display */}
            <div className="mb-4">
              <div className="grid grid-cols-5 gap-1.5 text-center mb-1.5 font-black text-sm">
                {(['B', 'I', 'N', 'G', 'O'] as BingoLetter[]).map((letter) => (
                  <div
                    key={letter}
                    className="py-1 rounded bg-slate-800 text-amber-400"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {inspectingClaim.cardSnapshot.map((row, r) =>
                  row.map((num, c) => {
                    const isFree = r === 2 && c === 2;
                    const isDaubed = inspectingClaim.daubedSnapshot?.[r]?.[c];
                    const isCalled = num === 0 || calledSet.has(num);
                    const isInvalidDaub = isDaubed && !isCalled;

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                          isFree
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                            : isInvalidDaub
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 ring-2 ring-rose-500'
                            : isDaubed && isCalled
                            ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                            : isCalled
                            ? 'bg-slate-800/80 border-slate-600 text-slate-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-600'
                        }`}
                      >
                        {isFree ? 'FREE' : num}
                        {isDaubed && (
                          <span
                            className={`text-[9px] font-semibold mt-0.5 ${
                              isInvalidDaub ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isInvalidDaub ? 'NOT CALLED' : 'DAUBED'}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Green: Daubed & Verified Against Called Balls</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Red: Marked by player but was NOT drawn!</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onVerifyClaim(inspectingClaim.id, 'verified');
                  setInspectingClaim(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Bingo Win
              </button>
              <button
                type="button"
                onClick={() => setInspectingClaim(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
