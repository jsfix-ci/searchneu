/* eslint-disable @typescript-eslint/ban-types */
import {
  GetPublicKeyOrSecret,
  Secret,
  SignCallback,
  SignOptions,
  VerifyCallback,
} from 'jsonwebtoken';

export function verify(
  token: string,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret,
  callback?: VerifyCallback
): void {
  callback(null, JSON.parse(token));
}

export function sign(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  signOptions: SignOptions,
  callback: SignCallback
): void {
  callback(null, JSON.stringify(payload));
}
