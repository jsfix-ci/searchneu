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
export default withUser(
  async (req, res): Promise<void> => {
    if (req.method === 'GET') {
      if (!req.user) {
        res.status(401).end();
        return;
      }
      // Refetch user with subscriptions joined
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { followedCourses: true, followedSections: true },
      });
      const data: GetUserResponse = {
        followedCourses: user.followedCourses.map((c) => c.courseHash),
        followedSections: user.followedSections.map((s) => s.sectionHash),
      };
      res.json(data);
    } else {
      res.status(404).end();
    }
  }
);
