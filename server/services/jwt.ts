import crypto from 'crypto';

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export interface JwtClaims {
  sub?: string;
  userId?: number;
  exp?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export function signJwt(payload: Record<string, unknown>, secret: string, options?: { expiresInSeconds?: number; subject?: string; jwtId?: string; }): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body: JwtClaims = {
    iat: nowSeconds,
    ...payload,
  };

  if (options?.expiresInSeconds) {
    body.exp = nowSeconds + options.expiresInSeconds;
  }
  if (options?.subject) {
    body.sub = options.subject;
  }
  if (options?.jwtId) {
    body.jti = options.jwtId;
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const headerJson = base64UrlDecode(encodedHeader);
  const payloadJson = base64UrlDecode(encodedPayload);

  let header: Record<string, unknown>;
  let payload: JwtClaims;
  try {
    header = JSON.parse(headerJson);
    payload = JSON.parse(payloadJson) as JwtClaims;
  } catch {
    throw new Error('Invalid token encoding');
  }

  if (header.alg !== 'HS256') {
    throw new Error('Unsupported JWT algorithm');
  }

  const expected = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
    throw new Error('Invalid token signature');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && nowSeconds >= payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}
