import { NextRequest } from 'next/server';
import { registerSSEClient } from '@/lib/sse';
import { getGameState, getClaims, getStorageBackend } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a TransformStream to stream SSE data
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Controller adapter for registerSSEClient
  const controllerAdapter = {
    enqueue: (chunk: Uint8Array) => {
      writer.write(chunk).catch((err) => {
        console.warn('[SSE] Error writing to stream:', err);
      });
    },
    close: () => {
      writer.close().catch(() => {});
    },
  } as unknown as ReadableStreamDefaultController<Uint8Array>;

  const unregister = registerSSEClient(controllerAdapter);

  // Send immediate initial sync state to connecting client
  (async () => {
    try {
      const [gameState, claims] = await Promise.all([getGameState(), getClaims()]);

      const initPayload = {
        type: 'INIT',
        data: {
          gameState,
          claims,
          storageBackend: getStorageBackend(),
        },
        timestamp: Date.now(),
      };

      await writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(initPayload)}\n\n`));
    } catch (err) {
      console.error('[SSE] Failed to send initial state:', err);
    }
  })();

  // Periodic heartbeat / ping every 20 seconds
  const pingInterval = setInterval(() => {
    try {
      const pingPayload = { type: 'PING', data: {}, timestamp: Date.now() };
      writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(pingPayload)}\n\n`)).catch(() => {
        clearInterval(pingInterval);
      });
    } catch {
      clearInterval(pingInterval);
    }
  }, 20000);

  // Handle client disconnect
  req.signal.addEventListener('abort', () => {
    clearInterval(pingInterval);
    unregister();
    writer.close().catch(() => {});
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering on proxies like Nginx
    },
  });
}
