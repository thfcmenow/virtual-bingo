'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, BingoClaim, BingoBall, SSEMessage } from '@/types/bingo';

interface UseBingoSyncOptions {
  onBallDrawn?: (ball: BingoBall) => void;
  onGameReset?: () => void;
  onBingoClaimed?: (claim: BingoClaim) => void;
  onClaimUpdated?: (claim: BingoClaim) => void;
}

export function useBingoSync(options: UseBingoSyncOptions = {}) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [claims, setClaims] = useState<BingoClaim[]>([]);
  const [dataDir, setDataDir] = useState<string>('/data/bingo');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());

  // Store options in ref to avoid re-triggering effect on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Manual fallback refresh
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/game');
      if (res.ok) {
        const data = await res.json();
        setGameState(data.gameState);
        setClaims(data.claims || []);
        if (data.dataDir) setDataDir(data.dataDir);
      }
    } catch (err) {
      console.warn('[useBingoSync] Failed to fetch game state:', err);
    }
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isCancelled = false;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      if (isCancelled) return;

      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const message: SSEMessage = JSON.parse(event.data);
            setLastEventTime(Date.now());

            switch (message.type) {
              case 'INIT': {
                setGameState(message.data.gameState);
                setClaims(message.data.claims || []);
                if (message.data.dataDir) setDataDir(message.data.dataDir);
                break;
              }
              case 'BALL_DRAWN': {
                const { ball, calledNumbers, gameState: newState } = message.data;
                setGameState((prev) => {
                  if (newState) return newState;
                  if (!prev) return null;
                  return {
                    ...prev,
                    calledNumbers,
                    currentBall: ball,
                  };
                });
                optionsRef.current.onBallDrawn?.(ball);
                break;
              }
              case 'GAME_RESET': {
                if (message.data.gameState) {
                  setGameState(message.data.gameState);
                } else {
                  setGameState((prev) => (prev ? { ...prev, calledNumbers: [], currentBall: null } : null));
                }
                setClaims([]);
                optionsRef.current.onGameReset?.();
                break;
              }
              case 'BINGO_CLAIMED': {
                const newClaim: BingoClaim = message.data;
                setClaims((prev) => {
                  const filtered = prev.filter((c) => c.id !== newClaim.id);
                  return [newClaim, ...filtered];
                });
                optionsRef.current.onBingoClaimed?.(newClaim);
                break;
              }
              case 'CLAIM_UPDATED': {
                const updatedClaim: BingoClaim = message.data;
                setClaims((prev) =>
                  prev.map((c) => (c.id === updatedClaim.id ? updatedClaim : c))
                );
                optionsRef.current.onClaimUpdated?.(updatedClaim);
                break;
              }
              case 'PING':
                // keep-alive
                break;
            }
          } catch (err) {
            console.error('[useBingoSync] Error parsing SSE payload:', err);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Attempt reconnect after 2 seconds
          if (!isCancelled) {
            reconnectTimeout = setTimeout(connect, 2000);
          }
        };
      } catch (err) {
        console.error('[useBingoSync] SSE initialization failed:', err);
        setIsConnected(false);
        if (!isCancelled) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    // Initial fetch in case SSE takes a moment
    refresh();
    connect();

    return () => {
      isCancelled = true;
      clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [refresh]);

  return {
    gameState,
    claims,
    dataDir,
    isConnected,
    lastEventTime,
    refresh,
  };
}
