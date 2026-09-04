import { SignOptions } from 'jsonwebtoken';
import { createRequire } from 'node:module';

const { sign, verify } = createRequire(__filename)('jsonwebtoken') as {
  sign: (
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: SignOptions,
  ) => string;
  verify: (token: string, secretOrPublicKey: string) => any;
};

export function signToken(
  payload: Record<string, unknown>,
  secret: string,
  options?: SignOptions,
): string {
  return sign(payload, secret, options);
}

export function verifyToken(token: string, secret: string) {
  return verify(token, secret);
}
