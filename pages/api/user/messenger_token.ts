import { NextApiRequest, NextApiResponse } from 'next';
import { signLoginToken, signMessengerToken } from '../../../utils/api/jwt';
import { prisma } from '../../../utils/api/prisma';

export interface GetMessengerTokenResponse {
  messengerToken: string;
  loginToken: string;
}

/**
 * ========================= GET /api/user/messenger_token =======================
 * Begin a facebook login session by getting a LoginToken and MessengerToken
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    const fbSession = await prisma.facebookLoginSessions.create({ data: {} });
    const data: GetMessengerTokenResponse = {
      messengerToken: await signMessengerToken(fbSession.id),
      loginToken: await signLoginToken(fbSession.id),
    };
    res.json(data);
    return;
  }
  res.status(404).end();
}
