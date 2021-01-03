import { Secret, verify } from 'jsonwebtoken';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';

// eslint-disable-next-line @typescript-eslint/ban-types
const verifyAsync = promisify<string, Secret, object | undefined>(verify);

type NextApiRequestWithUser = NextApiRequest & { userId?: number };
type NextApiHandlerWithUser<T = any> = (
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>
) => void | Promise<void>;

interface AuthTokenPayload {
  userId?: number;
}

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
      const jwtPayload: AuthTokenPayload = await verifyAsync(
        req.cookies.authToken,
        process.env.JWT_SECRET
      ).catch(); // swallow errors
      newReq.userId = jwtPayload?.userId;
    }
    return handler(newReq, res);
  };
}
