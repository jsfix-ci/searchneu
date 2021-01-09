import { NextApiRequest, NextApiResponse } from 'next';
import {
  LoginTokenPayload,
  MessengerTokenPayload,
  signAsync,
} from '../../../utils/api-middleware/jwt';
import { prisma } from '../../../utils/api-middleware/prisma';

export interface GetMessengerTokenResponse {
  messengerToken: string;
  loginToken: string;
}

// Begin the facebook login flow by getting LoginToken and MessengerToken
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    const fbSession = await prisma.facebookLoginSessions.create({ data: {} });
    const messengerToken: MessengerTokenPayload = {
      messenger: true,
      fbSessionId: fbSession.id,
    };
    const loginToken: LoginTokenPayload = {
      login: true,
      fbSessionId: fbSession.id,
    };
    const data: GetMessengerTokenResponse = {
      messengerToken: await signAsync(messengerToken),
      loginToken: await signAsync(loginToken),
    };
    res.json(data);
    return;
  }
  res.status(404).end();
}
