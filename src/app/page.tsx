'use client';

import React, { useState, useEffect } from 'react';
import { useBingoSync } from '@/hooks/useBingoSync';
import { Navbar } from '@/components/Navbar';
import { BingoCardGrid } from '@/components/BingoCardGrid';
import { BingoClaimButton } from '@/components/BingoClaimButton';
import { BingoBallBadge } from '@/components/BingoBallBadge';
import { Player, BingoClaim } from '@/types/bingo';
import { playBallDrawSound, playVictoryFanfare } from '@/lib/sounds';
import {
  Sparkles,
  User,
  History,
  Volume2,
  VolumeX,
  PlusCircle,
} from 'lucide-react';

const LOCAL_STORAGE_PLAYER_KEY = 'virtual_bingo_player_id';

export default function PlayerPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<BingoClaim | null>(null);

  // SSE real-time state sync
  const { gameState, claims, storageBackend, isConnected } = useBingoSync({
    onBallDrawn: () => {
      if (soundEnabled) playBallDrawSound();
    },
    onGameReset: () => {
      setSubmittedClaim(null);
    },
    onClaimUpdated: (claim: BingoClaim) => {
      if (player && claim.playerId === player.id) {
        if (claim.status === 'verified' && soundEnabled) {
          playVictoryFanfare();
        }
      }
    },
  });

  const calledNumbers = gameState?.calledNumbers || [];
  const currentBall = gameState?.currentBall || null;
  const activeClaim = player
    ? claims.find((claim) => claim.playerId === player.id) ??
      (submittedClaim?.playerId === player.id ? submittedClaim : null)
    : null;

  // Load existing player from localStorage on mount
  useEffect(() => {
    let isCancelled = false;

    const restorePlayer = async () => {
      const savedId = localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY);
      if (!savedId) return;

      try {
        const res = await fetch(`/api/players/${savedId}`);
        const data = res.ok ? await res.json() : null;
        if (!isCancelled && data?.player) {
          setPlayer(data.player);
        }
      } catch (error) {
        console.warn('Could not restore player:', error);
      }
    };

    void restorePlayer().finally(() => {
      if (!isCancelled) setIsLoadingPlayer(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Register / Join game
  const handleJoinGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoadingPlayer(true);

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerNameInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create player');

      setPlayer(data.player);
      localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, data.player.id);
      setSubmittedClaim(null);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  // Toggle Daub cell
  const handleToggleDaub = async (row: number, col: number) => {
    if (!player) return;

    // Optimistically update local UI state
    const newDaubed = player.daubed.map((r, rIdx) =>
      r.map((cVal, cIdx) => (rIdx === row && cIdx === col ? !cVal : cVal))
    );
    // Ensure center stays marked
    newDaubed[2][2] = true;

    setPlayer({
      ...player,
      daubed: newDaubed,
    });

    // Persist the updated card in Neon Postgres
    try {
      await fetch(`/api/players/${player.id}/daub`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row,
          col,
          daubed: newDaubed[row][col],
        }),
      });
    } catch (err) {
      console.warn('Failed to save daub update:', err);
    }
  };

  // Auto-daub all numbers currently on card that match calledNumbers
  const handleAutoDaubAll = async () => {
    if (!player) return;
    const calledSet = new Set(calledNumbers);
    const newDaubed = player.daubed.map((rowArr, r) =>
      rowArr.map((val, c) => {
        if (r === 2 && c === 2) return true;
        const num = player.card[r][c];
        if (calledSet.has(num)) return true;
        return val;
      })
    );

    setPlayer({
      ...player,
      daubed: newDaubed,
    });

    // Save each newly daubed cell
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (newDaubed[r][c] !== player.daubed[r][c]) {
          fetch(`/api/players/${player.id}/daub`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ row: r, col: c, daubed: true }),
          }).catch(() => {});
        }
      }
    }
  };

  // Start new card / player
  const handleNewCard = () => {
    localStorage.removeItem(LOCAL_STORAGE_PLAYER_KEY);
    setPlayer(null);
    setSubmittedClaim(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar isConnected={isConnected} storageBackend={storageBackend} />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center space-y-6">
        {/* Registration / Join Screen if player not created */}
        {!player ? (
          <div className="w-full max-w-md my-auto bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl animate-pop-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white">Join the Bingo Game</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your name or jump right in to get a randomized 5x5 card
              </p>
            </div>

            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Nickname / Player Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    placeholder="e.g. Lucky Winner"
                    maxLength={30}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingPlayer}
                className="w-full py-4 px-6 rounded-2xl font-black text-slate-950 text-base uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoadingPlayer ? 'Generating Card...' : 'Get My Lucky Card & Play!'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Your card persists in Neon Postgres
              </p>
            </div>
          </div>
        ) : (
          /* Active Player Game Screen */
          <div className="w-full space-y-6 animate-pop-in">
            {/* Top Player Info & Game Ticker */}
            <div className="w-full bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Player Profile & ID */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {player.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleNewCard}
                      className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      title="Generate a new card"
                    >
                      <PlusCircle className="w-3 h-3" />
                      New Card
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {player.id}
                  </span>
                </div>
              </div>

              {/* Called Numbers Counter & History Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>History ({calledNumbers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                  title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Drawn Ball Live Spotlight Ticker */}
            <div className="w-full bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {currentBall ? (
                  <BingoBallBadge
                    key={`${currentBall.number}-${currentBall.timestamp}`}
                    number={currentBall.number}
                    letter={currentBall.letter}
                    size="lg"
                    isLatest
                    animate
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs text-center p-2">
                    Waiting for call
                  </div>
                )}

                <div>
                  <div className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Latest Call from Presenter
                  </div>
                  {currentBall ? (
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      Ball {currentBall.letter}-{currentBall.number}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-400">
                      Presenter hasn&apos;t drawn any balls yet
                    </div>
                  )}
                </div>
              </div>

              {/* Total Balls summary */}
              <div className="text-right">
                <span className="text-xs text-slate-400">Balls Called:</span>
                <div className="text-xl font-black text-amber-400">
                  {calledNumbers.length} <span className="text-slate-600 text-sm">/ 75</span>
                </div>
              </div>
            </div>

            {/* The Interactive 5x5 Bingo Card */}
            <BingoCardGrid
              card={player.card}
              daubed={player.daubed}
              calledNumbers={calledNumbers}
              onToggleDaub={handleToggleDaub}
              onAutoDaubAll={handleAutoDaubAll}
              soundEnabled={soundEnabled}
            />

            {/* Prominent BINGO Claim Button */}
            <div className="pt-2">
              <BingoClaimButton
                playerId={player.id}
                activeClaim={activeClaim}
                onClaimSuccess={setSubmittedClaim}
              />
            </div>
          </div>
        )}
      </main>

      {/* Called Ball History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  Called Balls History ({calledNumbers.length}/75)
                </h4>
                <p className="text-xs text-slate-400">
                  Full list of drawn balls in order of call
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {calledNumbers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No balls have been drawn yet.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2 justify-center">
                  {calledNumbers.map((num, idx) => (
                    <BingoBallBadge
                      key={`${num}-${idx}`}
                      number={num}
                      size="sm"
                      isLatest={idx === calledNumbers.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
