import React, { useState } from 'react';
import { BingoLetter } from '@/types/bingo';
import { playDaubSound } from '@/lib/sounds';
import { Sparkles, Wand2, Star } from 'lucide-react';

interface BingoCardGridProps {
  card: number[][]; // 5x5
  daubed: boolean[][]; // 5x5
  calledNumbers: number[];
  onToggleDaub: (row: number, col: number) => void;
  onAutoDaubAll?: () => void;
  soundEnabled?: boolean;
}

const LETTERS: BingoLetter[] = ['B', 'I', 'N', 'G', 'O'];

const COLUMN_COLORS: Record<BingoLetter, { header: string; ring: string }> = {
  B: { header: 'bg-blue-600 text-white shadow-blue-500/30', ring: 'ring-blue-500' },
  I: { header: 'bg-rose-600 text-white shadow-rose-500/30', ring: 'ring-rose-500' },
  N: { header: 'bg-amber-500 text-slate-950 font-black shadow-amber-500/30', ring: 'ring-amber-500' },
  G: { header: 'bg-emerald-600 text-white shadow-emerald-500/30', ring: 'ring-emerald-500' },
  O: { header: 'bg-purple-600 text-white shadow-purple-500/30', ring: 'ring-purple-500' },
};

const DAUBER_COLORS = [
  { name: 'Ruby Red', color: 'rgba(239, 68, 68, 0.75)', ring: '#ef4444' },
  { name: 'Neon Blue', color: 'rgba(59, 130, 246, 0.75)', ring: '#3b82f6' },
  { name: 'Emerald', color: 'rgba(16, 185, 129, 0.75)', ring: '#10b981' },
  { name: 'Purple Ink', color: 'rgba(168, 85, 247, 0.75)', ring: '#a855f7' },
  { name: 'Hot Pink', color: 'rgba(236, 72, 153, 0.75)', ring: '#ec4899' },
];

export const BingoCardGrid: React.FC<BingoCardGridProps> = ({
  card,
  daubed,
  calledNumbers,
  onToggleDaub,
  onAutoDaubAll,
  soundEnabled = true,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const calledSet = new Set(calledNumbers);
  const dauber = DAUBER_COLORS[selectedColorIdx];

  const handleCellClick = (row: number, col: number) => {
    // Center is permanent FREE space
    if (row === 2 && col === 2) return;

    if (soundEnabled) {
      const willBeMarked = !daubed[row][col];
      playDaubSound(willBeMarked);
    }
    onToggleDaub(row, col);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl">
      {/* Card Header & Dauber Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Your Official Bingo Card
          </h3>
          <p className="text-xs text-slate-400">
            Click / tap numbers to stamp your card
          </p>
        </div>

        {/* Dauber Style Options & Auto Daub */}
        <div className="flex items-center gap-2">
          {/* Dauber ink picker */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {DAUBER_COLORS.map((d, idx) => (
              <button
                key={d.name}
                type="button"
                onClick={() => setSelectedColorIdx(idx)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedColorIdx === idx ? 'scale-125 ring-2 ring-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: d.ring }}
                title={`Dauber: ${d.name}`}
              />
            ))}
          </div>

          {/* Auto Daub button */}
          {onAutoDaubAll && (
            <button
              type="button"
              onClick={onAutoDaubAll}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
              title="Automatically daub all called numbers on your card"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Auto Daub
            </button>
          )}
        </div>
      </div>

      {/* 5x5 Bingo Grid Container */}
      <div className="bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800 shadow-inner">
        {/* Column Headers (B - I - N - G - O) */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-center">
          {LETTERS.map((letter) => {
            const theme = COLUMN_COLORS[letter];
            return (
              <div
                key={letter}
                className={`h-10 sm:h-12 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl select-none shadow-md ${theme.header}`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        {/* 5x5 Cell Matrix */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {card.map((row, r) =>
            row.map((num, c) => {
              const isFree = r === 2 && c === 2;
              const isMarked = isFree || Boolean(daubed[r]?.[c]);
              const isCalled = isFree || calledSet.has(num);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={isFree}
                  className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-200 select-none overflow-hidden group ${
                    isFree
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/30 border-2 border-amber-400 text-amber-300 font-black cursor-default shadow-lg shadow-amber-500/10'
                      : isMarked
                      ? 'bg-slate-900 border-2 border-slate-700 hover:border-slate-500'
                      : isCalled
                      ? 'bg-slate-850 border-2 border-amber-500/60 text-white hover:bg-slate-800 ring-2 ring-amber-500/30 animate-pulse'
                      : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-800/80 active:scale-95'
                  }`}
                  style={{
                    boxShadow: isFree
                      ? '0 0 15px rgba(245, 158, 11, 0.2)'
                      : undefined,
                  }}
                >
                  {/* Free Space Design */}
                  {isFree ? (
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 mb-0.5 animate-bounce-subtle" />
                      <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase">
                        FREE
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Number Text */}
                      <span className="text-lg sm:text-2xl font-black tracking-tight text-white z-0 group-hover:scale-105 transition-transform">
                        {num}
                      </span>

                      {/* Small Called Indicator Pill */}
                      {isCalled && !isMarked && (
                        <span className="absolute bottom-1 text-[9px] font-bold text-amber-400 uppercase tracking-tighter bg-amber-950/70 px-1 rounded border border-amber-500/30">
                          CALLED!
                        </span>
                      )}

                      {/* Dauber Stamp Overlay with Realistic Ink Effect */}
                      {isMarked && (
                        <div
                          className="absolute inset-1.5 sm:inset-2 rounded-full border-2 border-white/40 pointer-events-none flex items-center justify-center animate-daub-stamp"
                          style={{
                            backgroundColor: dauber.color,
                            boxShadow: `0 0 12px ${dauber.ring}, inset 0 0 8px rgba(255, 255, 255, 0.4)`,
                          }}
                        >
                          {/* Inner specular ring */}
                          <div className="w-3/4 h-3/4 rounded-full border border-white/30" />
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
