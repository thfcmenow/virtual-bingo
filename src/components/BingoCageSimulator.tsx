import React from 'react';
import { BingoBall } from '@/types/bingo';
import { BingoBallBadge } from './BingoBallBadge';
import { Sparkles, Volume2, VolumeX, Mic, MicOff, RotateCw } from 'lucide-react';

interface BingoCageSimulatorProps {
  currentBall: BingoBall | null;
  previousBalls: BingoBall[];
  isDrawing: boolean;
  onDrawNext: () => void;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  allBallsDrawn: boolean;
}

export const BingoCageSimulator: React.FC<BingoCageSimulatorProps> = ({
  currentBall,
  previousBalls,
  isDrawing,
  onDrawNext,
  soundEnabled,
  voiceEnabled,
  onToggleSound,
  onToggleVoice,
  allBallsDrawn,
}) => {
  const isSpinning = isDrawing;

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Bingo Tumbler Machine
            </h2>
            <p className="text-xs text-slate-400">
              Random ball selection from 75 regulation balls
            </p>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              voiceEnabled
                ? 'bg-slate-800 text-purple-400 border-purple-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={voiceEnabled ? 'Disable Voice Caller' : 'Enable Voice Caller (Reads Ball)'}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice Caller' : 'Voice Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Machine Section: Cage Tumbler + Current Ball Chute */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Bingo Tumbler Cage */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Outer metal ring cage */}
            <div
              className={`w-full h-full rounded-full border-4 border-amber-500/40 border-dashed transition-all duration-700 relative flex items-center justify-center ${
                isSpinning ? 'animate-spin' : 'animate-spin-slow'
              }`}
              style={{
                boxShadow:
                  '0 0 35px rgba(245, 158, 11, 0.25), inset 0 0 25px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Inner crossbars */}
              <div className="absolute inset-2 rounded-full border-2 border-slate-700/60" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-700/60 -translate-y-1/2" />
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-700/60 -translate-x-1/2" />

              {/* Tumbling mini colored balls inside */}
              <div className="absolute w-4 h-4 rounded-full bg-blue-500 shadow-md top-8 left-12 animate-bounce-subtle" />
              <div className="absolute w-4 h-4 rounded-full bg-rose-500 shadow-md bottom-10 right-10 animate-bounce" />
              <div className="absolute w-4 h-4 rounded-full bg-amber-400 shadow-md top-14 right-12 animate-pulse" />
              <div className="absolute w-4 h-4 rounded-full bg-emerald-500 shadow-md bottom-12 left-14 animate-bounce-subtle" />
              <div className="absolute w-4 h-4 rounded-full bg-purple-500 shadow-md top-20 left-24" />
            </div>

            {/* Cage Center Axle / Brass Hub */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-amber-200 shadow-xl flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-slate-950" />
            </div>

            {/* Chute spout on bottom-right */}
            <div className="absolute -bottom-2 right-4 w-12 h-7 bg-gradient-to-r from-slate-700 to-slate-800 rounded-b-xl border border-slate-600/80 shadow-lg transform rotate-12" />
          </div>

          {/* Draw Button under cage */}
          <div className="mt-6 w-full max-w-xs">
            <button
              type="button"
              onClick={onDrawNext}
              disabled={isDrawing || allBallsDrawn}
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl tracking-wide uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
                allBallsDrawn
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : isDrawing
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white cursor-wait scale-[0.98]'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-500 hover:to-amber-500 text-slate-950 font-black hover:scale-[1.02] active:scale-[0.98] shadow-amber-500/25 border-2 border-amber-300 ring-4 ring-amber-500/20'
              }`}
            >
              {isDrawing ? (
                <>
                  <RotateCw className="w-6 h-6 animate-spin" />
                  Spinning...
                </>
              ) : allBallsDrawn ? (
                'All 75 Drawn!'
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Draw Next Ball
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Current Ball Spotlight & Recent Calls */}
        <div className="md:col-span-7 flex flex-col items-center md:items-start justify-center pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0">
          <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Current Drawn Ball
          </div>

          {/* Big Hero Ball Display */}
          <div className="flex items-center gap-6 my-2">
            {currentBall ? (
              <div className="flex flex-col items-center">
                <BingoBallBadge
                  key={`${currentBall.number}-${currentBall.timestamp}`}
                  number={currentBall.number}
                  letter={currentBall.letter}
                  size="xl"
                  isLatest
                  animate
                />
              </div>
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 bg-slate-950/60 p-4 text-center">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">Ready to Draw</span>
              </div>
            )}

            {/* Current Ball Callout Text */}
            {currentBall && (
              <div className="flex flex-col">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
                  {currentBall.letter}-{currentBall.number}
                </span>
                <span className="text-sm text-slate-400 font-medium mt-1">
                  Regulation Ball #{currentBall.number}
                </span>
                <span className="text-xs text-amber-400 font-semibold mt-1">
                  Broadcast live to all players
                </span>
              </div>
            )}
          </div>

          {/* Recent 5 Balls Tray */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Previous Calls
            </div>
            {previousBalls.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {previousBalls.slice(0, 5).map((ball, idx) => (
                  <div key={`${ball.number}-${idx}`} className="flex items-center gap-1.5">
                    <BingoBallBadge
                      number={ball.number}
                      letter={ball.letter}
                      size="sm"
                    />
                    {idx < 4 && idx < previousBalls.length - 1 && (
                      <span className="text-slate-700 text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No previous calls yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
