import React from 'react';
import { BingoLetter, getLetterForNumber } from '@/types/bingo';

interface BingoBallBadgeProps {
  number: number;
  letter?: BingoLetter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLatest?: boolean;
  className?: string;
  animate?: boolean;
}

const LETTER_STYLES: Record<BingoLetter, { gradient: string; ring: string; text: string }> = {
  B: {
    gradient: 'from-blue-500 via-blue-600 to-indigo-800',
    ring: 'ring-blue-400',
    text: 'text-blue-200',
  },
  I: {
    gradient: 'from-rose-500 via-red-600 to-rose-900',
    ring: 'ring-rose-400',
    text: 'text-rose-200',
  },
  N: {
    gradient: 'from-amber-400 via-amber-500 to-amber-700',
    ring: 'ring-amber-300',
    text: 'text-amber-100',
  },
  G: {
    gradient: 'from-emerald-400 via-emerald-600 to-teal-800',
    ring: 'ring-emerald-400',
    text: 'text-emerald-100',
  },
  O: {
    gradient: 'from-purple-500 via-violet-600 to-purple-900',
    ring: 'ring-purple-400',
    text: 'text-purple-200',
  },
};

const SIZE_STYLES = {
  xs: {
    container: 'w-7 h-7 text-xs shadow',
    inner: 'w-5 h-5',
    letter: 'text-[9px]',
    num: 'text-[11px] font-bold',
  },
  sm: {
    container: 'w-9 h-9 text-xs shadow-md',
    inner: 'w-6 h-6',
    letter: 'text-[10px]',
    num: 'text-xs font-bold',
  },
  md: {
    container: 'w-12 h-12 text-sm shadow-lg',
    inner: 'w-8 h-8',
    letter: 'text-xs',
    num: 'text-sm font-black',
  },
  lg: {
    container: 'w-20 h-20 text-lg shadow-xl',
    inner: 'w-14 h-14',
    letter: 'text-sm font-semibold tracking-wider',
    num: 'text-xl font-black',
  },
  xl: {
    container: 'w-32 h-32 md:w-40 md:h-40 text-2xl shadow-2xl',
    inner: 'w-24 h-24 md:w-28 md:h-28',
    letter: 'text-base md:text-lg font-bold tracking-widest',
    num: 'text-3xl md:text-5xl font-black',
  },
};

export const BingoBallBadge: React.FC<BingoBallBadgeProps> = ({
  number,
  letter,
  size = 'md',
  isLatest = false,
  className = '',
  animate = false,
}) => {
  const ballLetter = letter || getLetterForNumber(number);
  const style = LETTER_STYLES[ballLetter];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} text-white select-none transition-transform ${
        sizeStyle.container
      } ${
        isLatest
          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 animate-pulse'
          : 'ring-1 ring-white/20'
      } ${animate ? 'animate-ball-roll' : ''} ${className}`}
      style={{
        boxShadow: isLatest
          ? '0 0 25px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -4px 8px rgba(0, 0, 0, 0.5)'
          : '0 6px 16px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Glossy 3D reflection highlight */}
      <div className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full bg-white/40 blur-[1px] pointer-events-none transform -rotate-12" />

      {/* Inner white circular badge typical for classic bingo balls */}
      <div
        className={`rounded-full bg-white text-slate-900 flex flex-col items-center justify-center shadow-inner ${sizeStyle.inner}`}
      >
        <span
          className={`leading-none uppercase font-extrabold ${sizeStyle.letter}`}
          style={{
            color:
              ballLetter === 'B'
                ? '#1d4ed8'
                : ballLetter === 'I'
                ? '#b91c1c'
                : ballLetter === 'N'
                ? '#b45309'
                : ballLetter === 'G'
                ? '#047857'
                : '#6d28d9',
          }}
        >
          {ballLetter}
        </span>
        <span className={`leading-none tracking-tight ${sizeStyle.num}`}>
          {number}
        </span>
      </div>
    </div>
  );
};
