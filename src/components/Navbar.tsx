'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, HardDrive } from 'lucide-react';

interface NavbarProps {
  isConnected?: boolean;
  storageBackend?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected = true,
  storageBackend = 'Neon Postgres',
}) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 text-lg">
                75
              </span>
            </div>
          </div>
          <div>
            <span className="font-black text-lg sm:text-xl text-white tracking-wider flex items-center gap-1.5">
              VIRTUAL<span className="text-amber-400">BINGO</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:inline">
                Full-Stack App Router
              </span>
            </div>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Storage Directory Indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono"
            title={`Persistent data stored in ${storageBackend}`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">Storage:</span>
            <span className="text-slate-300 truncate max-w-[150px]">{storageBackend}</span>
          </div>

          {/* SSE Live Status Indicator */}
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
              isConnected
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
            title={isConnected ? 'Real-time Server-Sent Events active' : 'Connecting to SSE...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="font-semibold hidden sm:inline">
              {isConnected ? 'Real-Time Sync' : 'Reconnecting...'}
            </span>
          </div>

          {/* View Switcher Navigation */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !isAdmin
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Player</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Host / Admin</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
