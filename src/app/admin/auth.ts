import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin-session';
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

export function passwordsMatch(submitted: string, expected: string): boolean {
  const submittedBuffer = Buffer.from(submitted);
  const expectedBuffer = Buffer.from(expected);

  return (
    submittedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(submittedBuffer, expectedBuffer)
  );
}

export function createAdminSessionToken(password: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const signature = createHmac('sha256', password)
    .update(String(expiresAt))
    .digest('hex');

  return `${expiresAt}.${signature}`;
}

export function isValidAdminSessionToken(
  token: string,
  password: string
): boolean {
  const [expiresAtValue, signature] = token.split('.');
  const expiresAt = Number(expiresAtValue);

  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', password)
    .update(String(expiresAt))
    .digest('hex');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}
