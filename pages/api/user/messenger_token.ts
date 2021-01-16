import { NextApiRequest, NextApiResponse } from 'next';
import {
  signLoginToken,
  signMessengerToken,
  verifyLoginToken,
} from '../../../utils/api/jwt';
import { prisma } from '../../../utils/api/prisma';
import setCookie from '../../../utils/api/setCookie';

export interface GetMessengerTokenResponse {
  messengerToken: string;
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
    const previousFBSession = await verifyLoginToken(req.cookies.loginToken);
    if (previousFBSession) {
      res.json({
        messengerToken: await signMessengerToken(previousFBSession.fbSessionId),
      });
    }

    const fbSession = await prisma.facebookLoginSessions.create({ data: {} });
    const data: GetMessengerTokenResponse = {
      messengerToken: await signMessengerToken(fbSession.id),
    };
    setCookie(res, 'loginToken', await signLoginToken(fbSession.id), {
      maxAge: 2000,
    });
    res.json(data);
    return;
  }
  res.status(404).end();
}
