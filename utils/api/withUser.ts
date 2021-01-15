import { User } from '@prisma/client';
import { NextApiHandler } from 'next';
import { verifyAuthToken } from './jwt';
import { prisma } from './prisma';

/**
 * Wrap a next api handler with req.userId set as the logged-in user
 * If no authToken cookie set or cookie is invalid, userId will be undefined.
 */
export default function withUser(
  generateHandler: (userId?: number, user?: User) => NextApiHandler
): NextApiHandler {
  return async (req, res) => {
    if (req.cookies.authToken) {
      const jwtPayload = await verifyAuthToken(req.cookies.authToken);
      if (!jwtPayload || typeof jwtPayload.userId !== 'number') {
        res.status(401).end();
        return;
      }
      const userId = jwtPayload.userId;
      const user =
        userId &&
        (await prisma.user.findUnique({
          where: { id: userId },
        }));
      return generateHandler(userId, user)(req, res);
    }
    return generateHandler()(req, res);
  };
}
