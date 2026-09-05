import crypto from 'node:crypto';

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  if (keyBuffer.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, hashBuffer);
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function signSessionToken(userId: string, secret: string, expiryHours = 24): string {
  const expiresAt = Date.now() + expiryHours * 3600 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [userId, expiresAtStr] = payload.split('.');
    if (!userId || !expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (signature.length !== expectedSig.length) return null;

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    return { userId };
  } catch {
    return null;
  }
}

