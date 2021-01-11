/* eslint-disable @typescript-eslint/ban-types */
import {
  Secret,
  GetPublicKeyOrSecret,
  VerifyCallback,
  SignCallback,
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
  callback: SignCallback
): void {
  callback(null, JSON.stringify(payload));
}
