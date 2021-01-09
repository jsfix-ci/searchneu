/* eslint-disable @typescript-eslint/ban-types */
import { Secret, sign, verify } from 'jsonwebtoken';
import { promisify } from 'util';

const verifyPromisified = promisify<string, Secret, object | undefined>(verify);

export async function verifyAsync(
  payload: string
): Promise<object | undefined> {
  return verifyPromisified(payload, process.env.JWT_SECRET);
}

const signPromisified = promisify<string, Secret, string>(sign);

export async function signAsync(payload: object): Promise<string> {
  return signPromisified(JSON.stringify(payload), process.env.JWT_SECRET);
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
export interface AuthTokenPayload {
  auth: true;
  userId: number;
}

/**
 *  The short-lived token sent to messenger to associate senderId with user
 */
export interface MessengerTokenPayload {
  messenger: true;
  fbSessionId: number;
}

/**
 * The short-lived token sent by the user to the backend to exchange for an AuthToken
 */
export interface LoginTokenPayload {
  login: true;
  fbSessionId: number;
}
