import { createServerClient } from '@lunnoa/client';

/** `server` = Pattern A (server holds the lna_ key), `user` = Pattern B (browser login). */
export function authMode(): 'server' | 'user' {
  return process.env.LUNNOA_AUTH_MODE === 'user' ? 'user' : 'server';
}

/**
 * Pattern A client. Server-only: call it from server components, route
 * handlers, or server actions, never from a 'use client' file.
 */
export function lunnoaServer() {
  const { LUNNOA_URL, LUNNOA_API_KEY } = process.env;
  if (!LUNNOA_URL || !LUNNOA_API_KEY) {
    throw new Error('Set LUNNOA_URL and LUNNOA_API_KEY in .env (see .env.example).');
  }
  return createServerClient({ baseUrl: LUNNOA_URL, apiKey: LUNNOA_API_KEY });
}
