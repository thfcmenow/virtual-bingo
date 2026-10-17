import { SSEEventDataMap, SSEEventType, SSEMessage } from '@/types/bingo';

type ClientController = ReadableStreamDefaultController<Uint8Array>;

// Global singleton to survive hot-reloads in development
declare global {
  var __sseClients: Set<ClientController> | undefined;
}

const clients: Set<ClientController> = global.__sseClients ?? new Set();
global.__sseClients = clients;

const encoder = new TextEncoder();

/**
 * Registers a new SSE client controller.
 */
export function registerSSEClient(controller: ClientController): () => void {
  clients.add(controller);
  console.log(`[SSE] Client connected. Total active clients: ${clients.size}`);

  // Return unsubscribe function
  return () => {
    clients.delete(controller);
    console.log(`[SSE] Client disconnected. Total active clients: ${clients.size}`);
  };
}

/**
 * Broadcasts an event to all connected SSE clients.
 */
export function broadcastSSE<Type extends SSEEventType>(
  type: Type,
  data: SSEEventDataMap[Type]
): void {
  const message = {
    type,
    data,
    timestamp: Date.now(),
  } as SSEMessage;

  const payload = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
  const encoded = encoder.encode(payload);

  const deadClients: ClientController[] = [];

  for (const client of clients) {
    try {
      client.enqueue(encoded);
    } catch {
      deadClients.push(client);
    }
  }

  // Cleanup disconnected clients
  for (const dead of deadClients) {
    clients.delete(dead);
  }
}

/**
 * Gets count of connected clients.
 */
export function getConnectedClientCount(): number {
  return clients.size;
}
