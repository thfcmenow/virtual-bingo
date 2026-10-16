import React from 'react';
import { BingoLetter, LETTER_RANGES } from '@/types/bingo';

interface MasterBoardGridProps {
  calledNumbers: number[];
  currentBallNumber?: number | null;
  onNumberClick?: (num: number) => void;
}

const LETTERS: BingoLetter[] = ['B', 'I', 'N', 'G', 'O'];

const ROW_THEMES: Record<BingoLetter, { headerBg: string; activeCell: string; border: string }> = {
  B: {
    headerBg: 'bg-blue-600 text-white shadow-blue-500/30',
    activeCell: 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 border-blue-400 font-bold',
    border: 'border-blue-900/40',
  },
  I: {
    headerBg: 'bg-rose-600 text-white shadow-rose-500/30',
    activeCell: 'bg-rose-600 text-white shadow-lg shadow-rose-500/50 border-rose-400 font-bold',
    border: 'border-rose-900/40',
  },
  N: {
    headerBg: 'bg-amber-500 text-slate-950 font-black shadow-amber-500/30',
    activeCell: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50 border-amber-300 font-black',
    border: 'border-amber-900/40',
  },
  G: {
    headerBg: 'bg-emerald-600 text-white shadow-emerald-500/30',
    activeCell: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 border-emerald-400 font-bold',
    border: 'border-emerald-900/40',
  },
  O: {
    headerBg: 'bg-purple-600 text-white shadow-purple-500/30',
    activeCell: 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 border-purple-400 font-bold',
    border: 'border-purple-900/40',
  },
};

export const MasterBoardGrid: React.FC<MasterBoardGridProps> = ({
  calledNumbers,
  currentBallNumber,
  onNumberClick,
}) => {
  const calledSet = new Set(calledNumbers);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Master Board (1–75)
          </h3>
          <p className="text-xs text-slate-400">
            Real-time synchronization across all player devices
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-slate-400 mr-1.5">Called:</span>
            <span className="text-amber-400 font-bold text-sm">
              {calledNumbers.length}
            </span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">75</span>
          </div>
          <div className="bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
            <span className="text-slate-400 mr-1.5">Remaining:</span>
            <span className="text-slate-200 font-bold text-sm">
              {75 - calledNumbers.length}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Rows for B, I, N, G, O */}
      <div className="space-y-2.5 overflow-x-auto pb-1">
        {LETTERS.map((letter) => {
          const [start, end] = LETTER_RANGES[letter];
          const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          const theme = ROW_THEMES[letter];

          return (
            <div
              key={letter}
              className={`flex items-center gap-1.5 sm:gap-2 min-w-[620px] p-1.5 rounded-xl bg-slate-950/60 border ${theme.border}`}
            >
              {/* Row Letter Header */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-lg shadow-md shrink-0 select-none ${theme.headerBg}`}
              >
                {letter}
              </div>

              {/* Number Cells 15 across */}
              <div className="grid grid-cols-15 gap-1 sm:gap-1.5 flex-1">
                {numbers.map((num) => {
                  const isCalled = calledSet.has(num);
                  const isLatest = currentBallNumber === num;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onNumberClick?.(num)}
                      className={`relative h-8 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm transition-all duration-200 select-none ${
                        isCalled
                          ? `${theme.activeCell} border`
                          : 'bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800/60 hover:bg-slate-850'
                      } ${
                        isLatest
                          ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-950 scale-105 z-10 animate-bounce-subtle'
                          : ''
                      }`}
                      title={
                        isCalled
                          ? `${letter}-${num} (Drawn)`
                          : `${letter}-${num} (Uncalled)`
                      }
                    >
                      {num}
                      {isLatest && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
