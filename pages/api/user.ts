import { verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';

const verifyAsync = promisify(verify);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const loginToken = req.cookies.loginToken;
  const isTokenValid = await verifyAsync(loginToken, process.env.JWT_SECRET);
  const userId = req.cookies.userId;

  return;
}
