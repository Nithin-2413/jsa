import { createHmac, timingSafeEqual } from 'node:crypto';

function getSecret(): string {
	const secret = process.env.ADMIN_JWT_SECRET || '';
	if (!secret) {
		throw new Error('ADMIN_JWT_SECRET must be set');
	}
	return secret;
}

function base64urlEncodeJson(obj: unknown): string {
	return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function base64urlDecodeJson<T = any>(input: string): T {
	const json = Buffer.from(input, 'base64url').toString('utf8');
	return JSON.parse(json) as T;
}

export interface TokenPayload {
	sub: string;
	iat?: number;
	exp?: number;
	[key: string]: unknown;
}

export function signJwt(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInSeconds = 60 * 60 * 24): string {
	const header = { alg: 'HS256', typ: 'JWT' } as const;
	const nowSeconds = Math.floor(Date.now() / 1000);
	const { sub, ...rest } = payload as { sub: string } & Record<string, unknown>;
	const fullPayload: TokenPayload = { sub, ...rest, iat: nowSeconds, exp: nowSeconds + expiresInSeconds };

	const headerB64 = base64urlEncodeJson(header);
	const payloadB64 = base64urlEncodeJson(fullPayload);
	const unsigned = `${headerB64}.${payloadB64}`;
	const signature = createHmac('sha256', getSecret()).update(unsigned).digest('base64url');
	return `${unsigned}.${signature}`;
}

export function verifyJwt(token: string): TokenPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const [headerB64, payloadB64, signature] = parts;
		const unsigned = `${headerB64}.${payloadB64}`;
		const expected = createHmac('sha256', getSecret()).update(unsigned).digest('base64url');
		if (expected.length !== signature.length) return null;
		if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

		const payload = base64urlDecodeJson<TokenPayload>(payloadB64);
		if (typeof payload.exp === 'number') {
			const nowSeconds = Math.floor(Date.now() / 1000);
			if (nowSeconds > payload.exp) return null;
		}
		return payload;
	} catch {
		return null;
	}
}