/* eslint-disable @typescript-eslint/ban-types */
import { ClassType } from 'class-transformer/ClassTransformer';
import { Equals, IsInt } from 'class-validator';
import { Secret, sign, verify } from 'jsonwebtoken';
import { promisify } from 'util';
import { validateObject } from './validate';

const verifyPromisified = promisify<string, Secret, object | undefined>(verify);
const signPromisified = promisify<string | Buffer | object, Secret, string>(
  sign
);

async function verifyAsync(payload: string): Promise<object | undefined> {
  return verifyPromisified(payload, process.env.JWT_SECRET);
}

async function signAsync(payload: object): Promise<string> {
  return signPromisified(payload, process.env.JWT_SECRET);
}

/**
 * LOGIN FLOW
 *
 *  Frontend                          Backend                   Facebook
 *   |                                  |                          |
 *   |   /user/messenger_token          |                          |
 *   |----------------------------->    |                          |
 *   |                                  |                          |
 *   |   LoginToken, MessengerToken     |                          |
 *   |<-----------------------------    |                          |
 *   |                                  |                          |
 *   |              MessengerToken      |                          |
 *   |----------------------------------|------------------------->|
 *   |                                  |                          |
 *   |                                  | MessengerToken, senderId |
 *   |                                  |<-------------------------|
 *   |                                  |                          |
 *   |       (pinging for 5 secs)       |                          |
 *   |        /login, LoginToken        |                          |
 *   |--------------------------------->|                          |
 *   |                                  |                          |
 *   |          AuthToken               |                          |
 *   |<---------------------------------|                          |
 */

/**
 *  The long-lived token set in cookies to authenticate a user
 */
export class AuthTokenPayload {
  @Equals(true)
  auth = true;
  @IsInt()
  userId: number;
  constructor(userId: number) {
    this.userId = userId;
  }
}

/**
 *  The short-lived token sent to messenger to associate senderId with user
 */
export class MessengerTokenPayload {
  @Equals(true)
  messenger = true;
  @IsInt()
  fbSessionId: number;
  constructor(fbSessionId: number) {
    this.fbSessionId = fbSessionId;
  }
}

/**
 * The short-lived token sent by the user to the backend to exchange for an AuthToken
 */
export class LoginTokenPayload {
  @Equals(true)
  login = true;
  @IsInt()
  fbSessionId: number;
  constructor(fbSessionId: number) {
    this.fbSessionId = fbSessionId;
  }
}

// Construct verifiers and signers for each token type
function TokenFactory<A extends object, T extends ClassType<A>>(
  tokenClass: T
): [
  (token: string) => Promise<InstanceType<T> | false>,
  (...args: ConstructorParameters<T>) => Promise<string>
] {
  async function verifyToken(token: string): Promise<InstanceType<T> | false> {
    try {
      const [payload] = await validateObject(
        tokenClass,
        await verifyAsync(token)
      );
      return payload as InstanceType<T>;
    } catch (e) {
      return false;
    }
  }

  async function signToken(...args: ConstructorParameters<T>): Promise<string> {
    return signAsync(new tokenClass(...args));
  }
  return [verifyToken, signToken];
}

export const [verifyAuthToken, signAuthToken] = TokenFactory(AuthTokenPayload);
export const [verifyMessengerToken, signMessengerToken] = TokenFactory(
  MessengerTokenPayload
);
export const [verifyLoginToken, signLoginToken] = TokenFactory(
  LoginTokenPayload
);
