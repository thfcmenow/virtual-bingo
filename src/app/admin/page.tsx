'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBingoSync } from '@/hooks/useBingoSync';
import { Navbar } from '@/components/Navbar';
import { BingoCageSimulator } from '@/components/BingoCageSimulator';
import { MasterBoardGrid } from '@/components/MasterBoardGrid';
import { ClaimsPanel } from '@/components/ClaimsPanel';
import {
  playBallDrawSound,
  playBingoAlertSound,
  playVictoryFanfare,
  speakBall,
} from '@/lib/sounds';
import { BingoBall, BingoClaim, BingoLetter } from '@/types/bingo';
import {
  RotateCcw,

  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isAutoDrawActive, setIsAutoDrawActive] = useState(false);
  const [autoDrawIntervalSec, setAutoDrawIntervalSec] = useState(7);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Incoming claim banner state
  const [newClaimAlert, setNewClaimAlert] = useState<BingoClaim | null>(null);

  const autoDrawTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time synchronization
  const { gameState, claims, dataDir, isConnected } = useBingoSync({
    onBallDrawn: (ball: BingoBall) => {
      if (soundEnabled) playBallDrawSound();
      if (voiceEnabled) speakBall(ball.letter, ball.number);
    },
    onBingoClaimed: (claim: BingoClaim) => {
      setNewClaimAlert(claim);
      if (soundEnabled) playBingoAlertSound();
    },
    onClaimUpdated: (claim: BingoClaim) => {
      if (claim.status === 'verified' && soundEnabled) {
        playVictoryFanfare();
      }
    },
    onGameReset: () => {
      setIsAutoDrawActive(false);
      setNewClaimAlert(null);
    },
  });

  const calledNumbers = gameState?.calledNumbers || [];
  const currentBall = gameState?.currentBall || null;
  const allBallsDrawn = calledNumbers.length >= 75;
  const isAutoDrawRunning = isAutoDrawActive && !allBallsDrawn;

  // Previous balls in reverse chronological order (excluding the current one)
  const previousBalls: BingoBall[] = React.useMemo(() => {
    if (!gameState) return [];
    const calls = [...gameState.calledNumbers];
    if (calls.length <= 1) return [];
    // slice off the latest one
    const prevNumbers = calls.slice(0, -1).reverse();
    return prevNumbers.map((num) => {
      let letter: BingoLetter = 'B';
      if (num > 15 && num <= 30) letter = 'I';
      else if (num > 30 && num <= 45) letter = 'N';
      else if (num > 45 && num <= 60) letter = 'G';
      else if (num > 60) letter = 'O';
      return { number: num, letter, timestamp: 0 };
    });
  }, [gameState]);

  // Draw Next Ball action
  const handleDrawNext = useCallback(async () => {
    if (isDrawing || allBallsDrawn) return;
    setIsDrawing(true);
    setActionError(null);

    try {
      const res = await fetch('/api/game/draw', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to draw ball');
      }
    } catch (error: unknown) {
      console.error('Error drawing ball:', error);
      setActionError(error instanceof Error ? error.message : 'Error drawing ball');
    } finally {
      setIsDrawing(false);
    }
  }, [isDrawing, allBallsDrawn]);

  // Reset Game action
  const handleResetGame = async () => {
    setIsAutoDrawActive(false);
    setActionError(null);
    try {
      const res = await fetch('/api/game/reset', {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to reset game');
      }
      setShowResetConfirm(false);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Error resetting game');
    }
  };

  // Claim verification action
  const handleVerifyClaim = async (
    claimId: string,
    status: BingoClaim['status']
  ) => {
    try {
      const res = await fetch('/api/claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status }),
      });
      if (!res.ok) {
        throw new Error('Failed to update claim');
      }
    } catch (error: unknown) {
      console.error('Error updating claim:', error);
    }
  };

  // Auto-Draw ticker
  useEffect(() => {
    if (isAutoDrawRunning) {
      autoDrawTimerRef.current = setInterval(() => {
        handleDrawNext();
      }, autoDrawIntervalSec * 1000);
    } else {
      if (autoDrawTimerRef.current) {
        clearInterval(autoDrawTimerRef.current);
        autoDrawTimerRef.current = null;
      }
    }

    return () => {
      if (autoDrawTimerRef.current) {
        clearInterval(autoDrawTimerRef.current);
      }
    };
  }, [isAutoDrawRunning, autoDrawIntervalSec, handleDrawNext]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar isConnected={isConnected} dataDir={dataDir} />

      {/* Real-time incoming Bingo Alert Flash Banner */}
      {newClaimAlert && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-slate-950 font-black px-4 py-3 shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚨</span>
            <span className="text-sm sm:text-base tracking-wide uppercase">
              BINGO ALERT! {newClaimAlert.playerName} ({newClaimAlert.playerId}) just yelled BINGO!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewClaimAlert(null)}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Presenter Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Presenter Console
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Session: {gameState?.id || 'Active'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Host / Admin Game Control
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto Draw Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsAutoDrawActive(!isAutoDrawRunning)}
                disabled={allBallsDrawn}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isAutoDrawRunning
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle automatic timed ball draw"
              >
                {isAutoDrawRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isAutoDrawRunning ? 'Auto: ON' : 'Auto Draw'}
              </button>

              {isAutoDrawRunning && (
                <select
                  value={autoDrawIntervalSec}
                  onChange={(e) => setAutoDrawIntervalSec(Number(e.target.value))}
                  className="bg-transparent text-amber-400 text-xs font-semibold px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={5} className="bg-slate-900">5s</option>
                  <option value={7} className="bg-slate-900">7s</option>
                  <option value={10} className="bg-slate-900">10s</option>
                  <option value={15} className="bg-slate-900">15s</option>
                </select>
              )}
            </div>

            {/* Test Player Screen Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>Open Player Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Reset Game Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/80 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Game
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500 text-rose-200 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Section 1: The Spinning Machine & Ball Draw Interface */}
        <BingoCageSimulator
          currentBall={currentBall}
          previousBalls={previousBalls}
          isDrawing={isDrawing}
          onDrawNext={handleDrawNext}
          soundEnabled={soundEnabled}
          voiceEnabled={voiceEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          allBallsDrawn={allBallsDrawn}
        />

        {/* Section 2: Full 1-75 Visual Master Board Grid */}
        <MasterBoardGrid
          calledNumbers={calledNumbers}
          currentBallNumber={currentBall?.number}
        />

        {/* Section 3: Real-Time Bingo Claims Panel */}
        <ClaimsPanel
          claims={claims}
          onVerifyClaim={handleVerifyClaim}
          calledNumbers={calledNumbers}
        />
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Current Game?</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              This will wipe all {calledNumbers.length} called numbers, clear active claims in{' '}
              <code className="text-amber-400 text-xs">/data/bingo/game-state.json</code>, and notify all
              connected players that a new game has started.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetGame}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors shadow-lg shadow-rose-950/50"
              >
                Yes, Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
