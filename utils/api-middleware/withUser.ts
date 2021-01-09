import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { AuthTokenPayload, verifyAsync } from './jwt';

type NextApiRequestWithUser = NextApiRequest & { userId?: number };
type NextApiHandlerWithUser<T = any> = (
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>
) => void | Promise<void>;

/**
 * Wrap a next api handler with req.userId set as the logged-in user
 * If no authToken cookie set or cookie is invalid, userId will be undefined.
 */
export default function withUser<T>(
  handler: NextApiHandlerWithUser<T>
): NextApiHandler<T> {
  return async (req, res) => {
    const newReq: NextApiRequestWithUser = req;
    if (req.cookies.authToken) {
      const jwtPayload = (await verifyAsync(
        req.cookies.authToken
      ).catch()) as AuthTokenPayload; // swallow errors
      if (typeof jwtPayload.userId !== 'number') {
        res.status(401).end();
        return;
      }
      newReq.userId = jwtPayload?.userId;
    }
    return handler(newReq, res);
  };
}
