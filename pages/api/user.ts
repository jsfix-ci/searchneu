import { NextApiHandler } from 'next';
import { prisma } from '../../utils/api/prisma';
import withUser from '../../utils/api/withUser';

export interface GetUserResponse {
  followedCourses: string[];
  followedSections: string[];
}

/**
 * ========================= GET /api/user =======================
 * Return user subscription info
 */
export default async function handler(req, res): Promise<void> {
  if (req.method === 'GET') {
    await get(req, res);
  } else {
    res.status(404).end();
  }
}

const get: NextApiHandler = withUser((userId, user) => async (req, res) => {
  if (!user) {
    res.status(401).end();
    return;
  }
  // Refetch user with subscriptions joined
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: { followedCourses: true, followedSections: true },
  });
  const data: GetUserResponse = {
    followedCourses: userData.followedCourses.map((c) => c.courseHash),
    followedSections: userData.followedSections.map((s) => s.sectionHash),
  };
  res.json(data);
  return;
});
